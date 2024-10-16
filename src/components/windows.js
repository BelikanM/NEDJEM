// src/components/windows.js
import React from 'react';

const ChatWindow = ({ currentUser }) => {
  return (
    <div>
      <h2>Chat avec {currentUser.name}</h2>
      <div className="chat-window">
        {/* Affichage des messages */}
      </div>
    </div>
  );
};

export default ChatWindow;

