import React, { useState } from 'react';
import './App.css';
import ChatWindow from './components/ChatWindow';
import logo from './assets/web-app-512x512.png';
import splashVideo from './assets/Splash-Screen-Video-800w-16x9.mp4';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Sabit provider ve agent değerleri
const FIXED_PROVIDER = 'openai';
const FIXED_AGENT = 'D1';

function App() {
  const [currentMessages, setCurrentMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingToolSuggestion, setPendingToolSuggestion] = useState(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

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

  const handleClearChat = () => {
    setCurrentMessages([]);
    setError(null);
    setPendingToolSuggestion(null);
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
        ai_provider: FIXED_PROVIDER,
        agent_id: FIXED_AGENT
      };

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('message', inputText);
        formData.append('ai_provider', FIXED_PROVIDER);
        formData.append('agent_id', FIXED_AGENT);

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

        // tool_suggestion varsa sistem mesajı olarak ekle
        if (data.tool_suggestion) {
          setPendingToolSuggestion(data.tool_suggestion);
        }

        // Parse response - handle both JSON hadith format and plain text
        let answerText = data.response || '';
        let hadiths = [];

        // Try to parse JSON response from LLM
        if (typeof answerText === 'string') {
          try {
            // Remove markdown code block if present
            let jsonStr = answerText;
            const jsonMatch = answerText.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
              jsonStr = jsonMatch[1];
            }
            const parsed = JSON.parse(jsonStr);
            if (parsed.answer) {
              answerText = parsed.answer;
              hadiths = parsed.hadiths || [];
            }
          } catch {
            // Not JSON, use as plain text
          }
        }

        // Add AI message with hadiths
        const aiMessage = {
          id: Date.now() + 1,
          text: answerText,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          hadiths: hadiths
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

  if (showSplash) {
    return (
      <div className="splash-screen">
        <video
          autoPlay
          muted
          playsInline
          onEnded={() => setShowSplash(false)}
          className="splash-video"
        >
          <source src={splashVideo} type="video/mp4" />
        </video>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-brand">
          <img src={logo} alt="Suffa AI Logo" className="header-logo" />
          <h1>Suffa AI</h1>
        </div>
        <button
          className="hamburger-btn"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Menüyü aç"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Menü</h2>
          <button
            className="sidebar-close-btn"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Menüyü kapat"
          >
            ×
          </button>
        </div>
        <div className="sidebar-content">
          <button
            className="sidebar-btn"
            onClick={handleLoadDocuments}
            disabled={isLoadingDocs}
          >
            {isLoadingDocs ? 'Yükleniyor...' : 'Doküman Yükle'}
          </button>
          <button
            className="sidebar-btn"
            onClick={handleClearChat}
            disabled={currentMessages.length === 0}
          >
            Sohbeti Temizle
          </button>
        </div>
      </div>

      <div className="main-content">
        <ChatWindow
          messages={currentMessages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          error={error}
          toolSuggestion={pendingToolSuggestion}
          onToolAccept={handleToolAccept}
          onToolReject={handleToolReject}
        />
      </div>
    </div>
  );
}

export default App;