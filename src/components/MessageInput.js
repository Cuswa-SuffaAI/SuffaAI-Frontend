import React, { useState, useRef } from 'react';
import './MessageInput.css';

function MessageInput({ onSendMessage, disabled }) {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null); // To trigger file input click

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
        // Optionally, you can display the selected file name or a preview
    }
  };

  const handleSend = () => {
    if (inputText.trim() || selectedFile) {
      onSendMessage(inputText, selectedFile);
      setInputText('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault(); // Prevent newline in textarea
      handleSend();
    }
  };

 const triggerFileInput = () => {
    if (!disabled) {
        fileInputRef.current.click();
    }
  };

  return (
    <div className={`message-input-area ${disabled ? 'disabled' : ''}`}>
      <button 
        className="attachment-button" 
        onClick={triggerFileInput} 
        title="Attach file" 
        disabled={disabled}
      >
        📎
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange} 
        disabled={disabled}
      />
      <textarea
        className="text-input"
        value={inputText}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={disabled ? "Processing..." : "Type your message or drop a file..."}
        rows="1"
        disabled={disabled}
      />
      <button 
        className="send-button" 
        onClick={handleSend} 
        title="Send message" 
        disabled={disabled || (!inputText.trim() && !selectedFile)}
      >
        ➢
      </button>
      {selectedFile && !disabled && (
        <div className="selected-file-info">
          Selected: {selectedFile.name}
          <button onClick={() => {setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = '';}} className="remove-file-button">×</button>
        </div>
      )}
    </div>
  );
}

export default MessageInput; 