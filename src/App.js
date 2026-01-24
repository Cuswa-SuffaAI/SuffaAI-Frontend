import React, { useState, useEffect } from 'react';
  import './App.css'; // We can add component-specific styles here later
  import Sidebar from './components/Sidebar';
  import ChatWindow from './components/ChatWindow';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function App() {
  const [currentMessages, setCurrentMessages] = useState([]);
  const [chatSessions, setChatSessions] = useState([{ id: 's1', name: 'Conversation' }]);
  const [activeChatSessionId, setActiveChatSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [availableProviders, setAvailableProviders] = useState([]);
  const [currentProvider, setCurrentProvider] = useState('');
  
  const [availableAgents, setAvailableAgents] = useState([]);
  const [currentAgent, setCurrentAgent] = useState('D1');
  const [pendingToolSuggestion, setPendingToolSuggestion] = useState(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const handleToolAccept = () => {
    // Send accept action to backend
    if (!pendingToolSuggestion || !pendingToolSuggestion.tool) return;
    fetch(`${API_BASE_URL}/api/tool-accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tool: pendingToolSuggestion.tool }),
    })
      .then(async (response) => {
        let data = await response.json();
        if (!response.ok) {
          // Backend'den gelen hata mesajını kullan
          const errorMsg = data.error || data.message || 'Failed to accept tool';
          setPendingToolSuggestion(null);
          setError(errorMsg);
          setCurrentMessages((prevMessages) => [
            ...prevMessages,
            {
              id: Date.now() + 4,
              text: `Tool error: ${errorMsg}`,
              sender: 'system',
              timestamp: new Date().toISOString(),
            },
          ]);
          throw new Error(errorMsg);
        }
        return data;
      })
      .then((data) => {
        console.log('Tool accepted:', data);
        setPendingToolSuggestion(null);
        let messageText;
        if (data.success === false) {
          messageText = `Tool error: ${data.error || data.message || JSON.stringify(data)}`;
          setError(data.error || data.message || 'Tool error');
        } else {
          messageText = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
          setError(null);
        }
        setCurrentMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now() + 3,
            text: messageText,
            sender: 'system',
            timestamp: new Date().toISOString(),
          },
        ]);
      })
      .catch((error) => {
        // Hata zaten yukarıda chat'e eklendiği için burada tekrar eklemeye gerek yok
        console.error('Error accepting tool:', error);
      });
  };

  const handleToolReject = () => {
    setPendingToolSuggestion(null);
    setCurrentMessages(prevMessages => [
      ...prevMessages,
      {
        id: Date.now() + 3,
        text: 'Tool suggestion dismissed.',
        sender: 'system',
        timestamp: new Date().toISOString(),
      }
    ]);
  };

  useEffect(() => {
    setCurrentMessages([]); 
    if (!activeChatSessionId && chatSessions.length > 0) {
    }
  }, [activeChatSessionId, chatSessions]); 

  useEffect(() => {
    console.log(`${API_BASE_URL}/api/models`);
    fetch(`${API_BASE_URL}/api/models`)
      .then(res => res.json())
      .then(models => {
        setAvailableProviders(models);
        if (models.length > 0) {
          setCurrentProvider(models[0].name); // or models[0].id depending on your backend structure
        }
      })
      .catch(console.error);
  }, []);

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

  useEffect(() => {
    console.log("Current provider:", currentProvider);
  }, [currentProvider]);

  useEffect(() => {
    console.log("Current agent:", currentAgent);
  }, [currentAgent]);

  const handleProviderChange = (event) => {
    setCurrentProvider(event.target.value);
  };

  const handleAgentChange = (event) => {
    setCurrentAgent(event.target.value);
  };

  const handleLoadDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/hadiths/load`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Dokümanlar yüklendi! Hadisler: ${data.hadiths?.hadiths_created || 0}, Embeddings: ${data.chunk_embeddings?.chunks_created || 0}`);
      } else {
        alert(`Hata: ${data.errors?.join(', ') || 'Bilinmeyen hata'}`);
      }
    } catch (err) {
      alert(`Yükleme hatası: ${err.message}`);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleSendMessage = async (inputText, file) => {
    if (!inputText.trim() && !file) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    if (file) {
      userMessage.file = { name: file.name, type: file.type };
    }

    setCurrentMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      let aiResponseMessage;
      const requestBody = { 
        message: inputText, 
        ai_provider: currentProvider,
        agent_id: currentAgent
      };

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('message', inputText);
        formData.append('ai_provider', currentProvider);
        formData.append('agent_id', currentAgent);

        const response = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ message: 'Failed to upload file and get response' }));
          throw new Error(errData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        aiResponseMessage = data.message || data.response || "File processed."; 
      } else {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ message: 'Failed to send message' }));
          throw new Error(errData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        aiResponseMessage = data.response;
        // tool_suggestion varsa sistem mesajı olarak ekle
        if (data.tool_suggestion) {
          setPendingToolSuggestion(data.tool_suggestion);
        }
        
        // Add sources to AI message
        const aiMessage = {
          id: Date.now() + 1,
          text: aiResponseMessage,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          sources: data.sources || []
        };
        setCurrentMessages(prevMessages => [...prevMessages, aiMessage]);
        
        // Return early to avoid duplicate message
        setIsLoading(false);
        return;
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponseMessage,
        sender: 'ai',
        timestamp: new Date().toISOString(),
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

  const handleSelectChatSession = (sessionId) => {
    setActiveChatSessionId(sessionId);
    setCurrentMessages([]);
    setError(null); 
  };

  const handleNewChat = () => {
    const newSessionId = `session_${Date.now()}`;
    setActiveChatSessionId(newSessionId); 
    setCurrentMessages([]);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Chatbot</h1>
        <div className="provider-selector-container">
          <button
            className="load-docs-btn"
            onClick={handleLoadDocuments}
            disabled={isLoadingDocs}
          >
            {isLoadingDocs ? '📄 Yükleniyor...' : '📄 Doküman Yükle'}
          </button>
          <div className="selector-group">
            <label htmlFor="ai-provider-select">AI Provider: </label>
            <select 
              id="ai-provider-select" 
              value={currentProvider} 
              onChange={handleProviderChange}
              className="provider-select"
            >
              {availableProviders.map(provider => (
                <option key={provider.id} value={provider.name}>
                  {provider.display_name}
                </option>
              ))}
            </select>
          </div>
          <div className="selector-group">
            <label htmlFor="ai-agent-select">Agent: </label>
            <select 
              id="ai-agent-select" 
              value={currentAgent} 
              onChange={handleAgentChange}
              className="agent-select"
            >
              {availableAgents.map(agent => (
                <option 
                  key={agent.id} 
                  value={agent.id}
                  disabled={!agent.enabled}
                >
                  {agent.name} {!agent.enabled ? '(Disabled)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>
      <div className="main-content">
        <Sidebar 
          chatSessions={chatSessions} 
          activeSessionId={activeChatSessionId} 
          onSelectSession={handleSelectChatSession} 
          onNewChat={handleNewChat} 
        />
        <ChatWindow 
          messages={currentMessages} 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
          error={error}
          activeSessionName={chatSessions.find(s => s.id === activeChatSessionId)?.name || "New Chat"}
          toolSuggestion={pendingToolSuggestion}
          onToolAccept={handleToolAccept}
          onToolReject={handleToolReject}
        />
      </div>
    </div>
  );
}

export default App;