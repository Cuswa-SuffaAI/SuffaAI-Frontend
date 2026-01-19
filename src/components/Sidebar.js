import React from 'react';
import './Sidebar.css';

function Sidebar({ chatSessions, activeSessionId, onSelectSession, onNewChat }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Chat History</h2>
      </div>
      <ul className="chat-session-list">
        {chatSessions.map(session => (
          <li 
            key={session.id} 
            className={`chat-session-item ${session.id === activeSessionId ? 'active' : ''}`}
            onClick={() => onSelectSession(session.id)}
          >
            {session.name}
          </li>
        ))}
        {chatSessions.length === 0 && (
            <li className="chat-session-item-empty">No chats yet. Start a new one!</li>
        )}
      </ul>
      <div className="sidebar-footer">
        {/* <button className="new-chat-button" onClick={onNewChat}>+ New Chat</button> */}
      </div>
    </div>
  );
}

export default Sidebar; 