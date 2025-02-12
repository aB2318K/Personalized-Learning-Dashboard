import React, { useState, useEffect } from 'react';
import { FaBullhorn, FaRegLightbulb } from 'react-icons/fa'; 
import { quotes } from '../assets/quotes';

function Motivation({ type }) {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    fetchQuotes();
  }, [type]);

  const fetchQuotes = () => {
    const filteredQuotes = quotes.filter((q) => q.type === type);
    const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
    setQuote(randomQuote);
  };

  // Select icon based on type
  const getIcon = () => {
    if (type === "Motivation") {
      return <FaBullhorn className="text-2xl mr-2 text-yellow-500" />;
    } else if (type === "Learning Tip") {
      return <FaRegLightbulb className="text-2xl mr-2 text-yellow-500" />;
    }
    return null;
  };

  return (
    <div className="flex items-center">
      {getIcon()}
      <p className="text-sm font-bold text-gray-600 font-mono text-shadow-lg">
        <span className="animated-text">{quote?.text || "Loading..."}</span>
      </p>
    </div>
  );
}

export default Motivation;
