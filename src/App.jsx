import React, { useEffect, useState } from 'react';
import Sidebar from './components/sidebar/Sidebar'
import MainContent from './components/main/MainContent';
import { useSidebar } from './components/sidebar/SidebarContext';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function App() {


  const [currentMessages, setCurrentMessages] = useState([]);

  //helper states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  //main states
  const [currentProvider, setCurrentProvider] = useState('');
  const [availableProviders, setAvailableProviders] = useState([]);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [currentAgent, setCurrentAgent] = useState('D1');

  //1-)Load Documents
    useEffect(() => {
      const loadDocuments = async () => {
        setIsLoadingDocs(true);
        try {
          const response = await fetch(`${API_BASE_URL}/api/hadiths/load`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });

          const data = await response.json();

          if (response.ok) {
            alert(
              `Dokümanlar yüklendi! Hadisler: ${data.hadiths?.hadiths_created || 0
              }, Embeddings: ${data.chunk_embeddings?.chunks_created || 0
              }`
            );
          } else {
            alert(`Hata: ${data.errors?.join(', ') || 'Bilinmeyen hata'}`);
          }
        } catch (err) {
          alert(`Yükleme hatası: ${err.message}`);
        } finally {
          setIsLoadingDocs(false);
        }
      };

      loadDocuments();
    }, []);

  //2-)Load Models
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


  //3-Load Agents
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

    setCurrentMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = { 
        message: inputText, 
        ai_provider: currentProvider,
        agent_id: currentAgent
      };

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({
          message: 'Failed to send message'
        }));
        throw new Error(errData.error || errData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Tool suggestion varsa kaydet
      if (data.tool_suggestion) {
        setPendingToolSuggestion(data.tool_suggestion);
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: data.answer,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        sources: data.sources || []
      };

      setCurrentMessages(prevMessages => [...prevMessages, aiMessage]);

    } catch (err) {
      setError(err.message);

      const errorMessage = {
        id: Date.now() + 1,
        text: `Error: ${err.message}`,
        sender: 'system',
        timestamp: new Date().toISOString(),
      };

      setCurrentMessages(prevMessages => [...prevMessages, errorMessage]);
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

      />
    </div>
  )
}