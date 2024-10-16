// src/components/send.js
import React from 'react';

const SendButtons = ({ onAudio, onMedia }) => {
  return (
    <div>
      <button onClick={onAudio}>Audio</button>
      <button onClick={onMedia}>Médias</button>
    </div>
  );
};

export default SendButtons;
