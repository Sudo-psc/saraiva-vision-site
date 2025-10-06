import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';

const SearchBar = ({ onSearch, placeholder = "Buscar conteúdo..." }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const searchSuggestions = [
    'Catarata',
    'Glaucoma',
    'Cirurgia refrativa',
    'Lentes de contato',
    'Exame de vista',
    'Oftalmopediatria',
    'Retina',
    'Córnea',
    'Blog',
    'Serviços'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target) &&
        suggestionsRef.current && !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="relative max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="pl-12 pr-12 py-4 text-lg border-gray-200 focus:border-blue-400 focus:ring-blue-400 shadow-sm bg-white/90 backdrop-blur-sm"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && query.length > 0 && (
        <motion.div
          ref={suggestionsRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
        >
          <div className="max-h-60 overflow-y-auto">
            {searchSuggestions
              .filter(suggestion =>
                suggestion.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 6)
              .map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 group"
                >
                  <Search className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                  <span className="text-gray-700 group-hover:text-gray-900">
                    {suggestion}
                  </span>
                </motion.button>
              ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SearchBar;