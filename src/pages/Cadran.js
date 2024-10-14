import React from 'react';

const Cadran = () => (
  <div className="cadran">
    <span className="text">CTRI</span>
    <style jsx>{`
      .cadran {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        width: 200px;
        background: linear-gradient(135deg, green, yellow, blue);
        border-radius: 50%;
        border: 5px solid black;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        animation: scintiller 1s infinite alternate;
      }

      .text {
        font-size: 24px;
        font-weight: bold;
        color: black;
        text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
      }

      @keyframes scintiller {
        from {
          opacity: 1;
        }
        to {
          opacity: 0.5;
        }
      }
    `}</style>
  </div>
);

export default Cadran;
