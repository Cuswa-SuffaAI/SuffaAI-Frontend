import React, { useEffect, useRef, useState } from 'react';
import './MessageInput.css';

function MessageInput({ onSendMessage, disabled }) {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef(null);

  const resizeTextarea = (textareaEl) => {
    if (!textareaEl) return;
    textareaEl.style.height = 'auto';
    const maxHeightPx = 180;
    textareaEl.style.height = `${Math.min(textareaEl.scrollHeight, maxHeightPx)}px`;
  };

  useEffect(() => {
    resizeTextarea(textareaRef.current);
  }, [inputText]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    resizeTextarea(e.target);
  };

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText, null);
      setInputText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`message-input-area ${disabled ? 'disabled' : ''}`}>
      <textarea
        ref={textareaRef}
        className="text-input"
        value={inputText}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={disabled ? "Sabırla..." : "Mesajınızı yazın..."}
        rows="1"
        disabled={disabled}
      />
      <button
        className="send-button"
        onClick={handleSend}
        title="Send message"
        disabled={disabled || !inputText.trim()}
      >
        ➢
      </button>
    </div>
  );
}

export default MessageInput;
