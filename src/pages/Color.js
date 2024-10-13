import React, { useEffect } from 'react';

const Color = ({ setColors, randomMode }) => {
  const colorCombinations = [
    { bg: 'bg-green-500', text: 'text-black' }, // Green with black text
    { bg: 'bg-yellow-500', text: 'text-black' }, // Yellow with black text
    { bg: 'bg-blue-500', text: 'text-black' },  // Blue with black text for improved readability
    { bg: 'bg-green-700', text: 'text-black' }, // Dark green with black text
    { bg: 'bg-blue-700', text: 'text-black' },  // Dark blue with black text
  ];

  useEffect(() => {
    if (!randomMode) return;

    const changeColor = () => {
      const randomIndex = Math.floor(Math.random() * colorCombinations.length);
      setColors(colorCombinations[randomIndex]);
    };

    const interval = setInterval(changeColor, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [setColors, randomMode]);

  return null; // No UI, just logic
};

export default Color;
