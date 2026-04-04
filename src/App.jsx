import React, { useEffect, useState } from 'react';
import Sidebar from './components/sidebar/Sidebar'
import MainContent from './components/main/MainContent';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const parseJsonIfPossible = (value) => {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(normalized);
  } catch {
    return null;
  }
};

const normalizeChatPayload = (payload) => {
  const parsedFromResponse = parseJsonIfPossible(payload?.response);

  const answer =
    parsedFromResponse?.answer ||
    payload?.answer ||
    payload?.response ||
    'Cevap alinamadi.';

  const hadiths = Array.isArray(parsedFromResponse?.hadiths)
    ? parsedFromResponse.hadiths
    : Array.isArray(payload?.hadiths)
      ? payload.hadiths
      : [];

  const sources = Array.isArray(payload?.sources)
    ? payload.sources
    : Array.isArray(parsedFromResponse?.sources)
      ? parsedFromResponse.sources
      : [];

  const sections = Array.isArray(parsedFromResponse?.sections)
    ? parsedFromResponse.sections
    : Array.isArray(payload?.sections)
      ? payload.sections
      : [];

  const fetvalar = Array.isArray(parsedFromResponse?.fetvalar)
    ? parsedFromResponse.fetvalar
    : Array.isArray(payload?.fetvalar)
      ? payload.fetvalar
      : [];

  return { answer, hadiths, sections, sources, fetvalar };
};


export default function App() {


  const [currentMessages, setCurrentMessages] = useState([]);

  //helper states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  //main states
  const [currentProvider, setCurrentProvider] = useState('');
  const [availableProviders, setAvailableProviders] = useState([]);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [currentAgent, setCurrentAgent] = useState('D1');
  const [chatSource, setChatSource] = useState('hadith');

  const sourceOptions = [
    { value: 'hadith', label: 'Hadis' },
    { value: 'siyer', label: 'Siyer' },
    { value: 'fetva', label: 'Fetva' },
  ];


  //1-)Load Models
    useEffect(() => {
      console.log(`${API_BASE_URL}/api/models`);
      fetch(`${API_BASE_URL}/api/models`)
        .then(res => res.json())
        .then(models => {
          setAvailableProviders(models);
          if (models.length > 0) {
            setCurrentProvider(models[0].name);
          }
        })
        .catch(console.error);
    }, []);


  //2-Load Agents
    useEffect(() => {
      console.log(`${API_BASE_URL}/api/agents`);
      fetch(`${API_BASE_URL}/api/agents`)
        .then(res => res.json())
        .then(agents => {
          setAvailableAgents(agents);
          // Set D1 as default agent if available
          const d1Agent = agents.find(agent => agent.id === 'D1');
          if (d1Agent) {
            setCurrentAgent(d1Agent.id);
          }
        })
        .catch(console.error);
    }, []);


  const handleSendMessage = async (inputText) => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    const aiMessageId = Date.now() + 1;
    const placeholderMessage = {
      id: aiMessageId,
      text: { answer: '', hadiths: [], sections: [], sources: [], fetvalar: [] },
      sender: 'ai',
      timestamp: new Date().toISOString(),
      sources: [],
      isStreaming: true,
      hasStreamContent: false,
    };

    setCurrentMessages(prevMessages => [...prevMessages, userMessage, placeholderMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        message: inputText,
        ai_provider: currentProvider,
        agent_id: currentAgent,
        source: chatSource,
      };

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: 'Failed to send message' }));
        throw new Error(errData.error || errData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const normalizedData = normalizeChatPayload(data);

      setCurrentMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id !== aiMessageId ? msg : {
            ...msg,
            text: normalizedData,
            sources: normalizedData.sources || [],
            isStreaming: false,
            hasStreamContent: true,
          }
        )
      );

    } catch (err) {
      setError(err.message);

      setCurrentMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, isStreaming: false, hasStreamContent: false }
            : msg
        )
      );

      setCurrentMessages(prevMessages => [...prevMessages, {
        id: Date.now() + 1,
        text: `Error: ${err.message}`,
        sender: 'system',
        timestamp: new Date().toISOString(),
      }]);

    } finally {
      setIsLoading(false);
    }
  };







  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MainContent
        messages={currentMessages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading} 
        error={error}
        chatSource={chatSource}
        onChatSourceChange={setChatSource}
        sourceOptions={sourceOptions}

      />
    </div>
  )
}