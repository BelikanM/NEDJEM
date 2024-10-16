// src/components/input.js
import React from 'react';

const InputMessage = ({ onSend }) => {
  const [message, setMessage] = React.useState('');

  const handleSend = () => {
    onSend(message);
    setMessage('');
  };

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Écrire un message"
      />
      <button onClick={handleSend}>Envoyer</button>
    </div>
  );
};

export default InputMessage;
