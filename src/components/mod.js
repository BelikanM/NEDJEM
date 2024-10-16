// src/components/mod.js
import React from 'react';

const MessageList = ({ messages, onEdit, onDelete }) => {
  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          <p>{message.text}</p>
          <button onClick={() => onEdit(message.id)}>Modifier</button>
          <button onClick={() => onDelete(message.id)}>Supprimer</button>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
