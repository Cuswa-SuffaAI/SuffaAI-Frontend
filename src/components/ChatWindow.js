import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatWindow.css';
import MessageInput from './MessageInput';

function ChatWindow({ messages, onSendMessage, isLoading, error, activeSessionName, toolSuggestion, onToolAccept, onToolReject }) {
  const messagesEndRef = useRef(null);
  const [expandedSources, setExpandedSources] = useState({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const toggleSources = (messageId) => {
    setExpandedSources(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  return (
    <div className="chat-window">
        <div className="chat-window-header">
            <h3>{activeSessionName || "Chat"}</h3>
        </div>
      <div className="message-list">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender} ${msg.sender === 'system' ? 'system-message' : ''}`}>
            <div className="message-bubble">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
                {msg.file && <div className="file-attachment">Attached: {msg.file.name}</div>}
                
                {/* Show sources if available */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="sources-section">
                    <button 
                      className="sources-toggle" 
                      onClick={() => toggleSources(msg.id)}
                    >
                      {expandedSources[msg.id] ? '📚 Hide Sources' : `📚 View ${msg.sources.length} Sources`}
                    </button>
                    
                    {expandedSources[msg.id] && (
                      <div className="sources-list">
                        {msg.sources.map((source, idx) => (
                          <div key={idx} className="source-item">
                            <div className="source-header">
                              <strong>Hadis #{source.hadith_number}</strong>
                              <span className="source-similarity">
                                {(source.similarity * 100).toFixed(0)}% eşleşme
                              </span>
                            </div>
                            {source.sources && source.sources.length > 0 && (
                              <div className="source-names">
                                Kaynak: {source.sources.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        ))}
        {toolSuggestion && (
          <div className="tool-suggestion-banner">
            <div>{toolSuggestion.message}</div>
            <button onClick={onToolAccept} className="tool-suggestion-btn tool-accept">Run Tool</button>
            <button onClick={onToolReject} className="tool-suggestion-btn tool-reject">Dismiss</button>
          </div>
        )}
        {isLoading && (
          <div className="message system-message">
            <div className="message-bubble">Typing...</div>
          </div>
        )}
        {!activeSessionName && messages.length === 0 && !isLoading && (
            <div className="no-chat-selected">
                <p>Select a chat from the sidebar or start a new one!</p>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={onSendMessage} disabled={isLoading || !activeSessionName} />
      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}

export default ChatWindow;