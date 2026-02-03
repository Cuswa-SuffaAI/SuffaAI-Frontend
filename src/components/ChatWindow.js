import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatWindow.css';
import MessageInput from './MessageInput';
import HadithCard from './HadithCard';
import SiyerCard from './SiyerCard';

function ChatWindow({ messages, onSendMessage, isLoading, error, toolSuggestion, onToolAccept, onToolReject, selectedSource, onSourceChange }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="chat-window">
      <div className="message-list">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender} ${msg.sender === 'system' ? 'system-message' : ''}`}>
            <div className="message-bubble">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
                {msg.file && <div className="file-attachment">Attached: {msg.file.name}</div>}

                {/* Show hadith cards if available */}
                {msg.hadiths && msg.hadiths.length > 0 && (
                  <div className="hadiths-section">
                    {msg.hadiths.map((hadith, idx) => (
                      <HadithCard key={idx} hadith={hadith} />
                    ))}
                  </div>
                )}

                {/* Show siyer cards if available */}
                {msg.siyerSections && msg.siyerSections.length > 0 && (
                  <div className="siyer-sections">
                    {msg.siyerSections.map((section, idx) => (
                      <SiyerCard key={idx} section={section} />
                    ))}
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
            <div className="message-bubble">Sabırla...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="source-toggle">
        <button
          className={`source-toggle-btn ${selectedSource === 'hadith' ? 'active' : ''}`}
          onClick={() => onSourceChange('hadith')}
          disabled={isLoading}
        >
          Hadis
        </button>
        <button
          className={`source-toggle-btn ${selectedSource === 'siyer' ? 'active' : ''}`}
          onClick={() => onSourceChange('siyer')}
          disabled={isLoading}
        >
          Siyer
        </button>
      </div>
      <MessageInput onSendMessage={onSendMessage} disabled={isLoading} />
      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}

export default ChatWindow;