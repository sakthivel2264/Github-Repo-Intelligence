import React from 'react';
import type { Languages } from '../types/api';

interface LanguagesChartProps {
  languages: Languages;
}

const LanguagesChart: React.FC<LanguagesChartProps> = ({ languages }) => {
  const getLanguageColor = (language: string): string => {
    const colors: { [key: string]: string } = {
      JavaScript: '#f1e05a',
      TypeScript: '#2b7489',
      Python: '#3572A5',
      Java: '#b07219',
      'C++': '#f34b7d',
      C: '#555555',
      'C#': '#239120',
      PHP: '#4F5D95',
      Ruby: '#701516',
      Go: '#00ADD8',
      Rust: '#dea584',
      Swift: '#ffac45',
      Kotlin: '#F18E33',
      HTML: '#e34c26',
      CSS: '#1572B6',
    };
    return colors[language] || '#666666';
  };

  const sortedLanguages = Object.entries(languages.language_percentage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Programming Languages</h3>
      
      <div className="space-y-4">
        {sortedLanguages.map(([language, percentage]) => (
          <div key={language} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: getLanguageColor(language) }}
            ></div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{language}</span>
                <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: getLanguageColor(language),
                    width: `${percentage}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguagesChart;
