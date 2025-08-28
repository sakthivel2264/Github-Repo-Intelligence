// src/components/SearchForm.tsx
import React, { useState } from 'react';

interface SearchFormProps {
  onSearch: (input: string) => void;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
    }
  };

  const fillExample = (example: string) => {
    setInput(example);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
        🔍 Git Repository Intelligence Hub
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <input
            type="text"
            placeholder="Enter GitHub URL or owner/repo (e.g., microsoft/typescript)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 max-w-2xl px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            disabled={loading}
            required
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </div>
            ) : (
              'Analyze Repository'
            )}
          </button>
        </div>
        
        {/* Example buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          <p className="text-sm text-gray-600 w-full text-center mb-2">Try these examples:</p>
          <button
            type="button"
            onClick={() => fillExample('https://github.com/microsoft/typescript')}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            https://github.com/microsoft/typescript
          </button>
          <button
            type="button"
            onClick={() => fillExample('facebook/react')}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            facebook/react
          </button>
         
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
