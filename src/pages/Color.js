import React, { useEffect, useMemo } from 'react';

const Color = ({ setColors, randomMode }) => {
  const colorCombinations = useMemo(() => [
    { bg: 'bg-green-500', text: 'text-black' },
    { bg: 'bg-yellow-500', text: 'text-black' },
    { bg: 'bg-blue-500', text: 'text-black' },
    { bg: 'bg-green-700', text: 'text-black' },
    { bg: 'bg-blue-700', text: 'text-black' },
  ], []);

  useEffect(() => {
    if (!randomMode) return;

    const changeColor = () => {
      const randomIndex = Math.floor(Math.random() * colorCombinations.length);
      setColors(colorCombinations[randomIndex]);
    };

    const interval = setInterval(changeColor, 3000);

    return () => clearInterval(interval);
  }, [setColors, randomMode, colorCombinations]);

  return null;
};

export default Color;
