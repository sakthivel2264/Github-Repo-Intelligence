import React from 'react';
import type { Commits } from '../types/api';

interface CommitsAnalysisProps {
  commits: Commits;
}

const CommitsAnalysis: React.FC<CommitsAnalysisProps> = ({ commits }) => {
  const categoryColors: { [key: string]: string } = {
    feat: 'bg-green-100 text-green-800',
    fix: 'bg-red-100 text-red-800',
    docs: 'bg-blue-100 text-blue-800',
    style: 'bg-purple-100 text-purple-800',
    refactor: 'bg-yellow-100 text-yellow-800',
    test: 'bg-indigo-100 text-indigo-800',
    chore: 'bg-gray-100 text-gray-800',
    others: 'bg-pink-100 text-pink-800',
  };

  const categoryLabels: { [key: string]: string } = {
    feat: '✨ Features',
    fix: '🐛 Bug Fixes',
    docs: '📚 Documentation',
    style: '💄 Styling',
    refactor: '♻️ Refactoring',
    test: '🧪 Tests',
    chore: '🔧 Chores',
    others: '📝 Others',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Commit Analysis</h3>
      
      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900 text-center">
          {commits.total_commits.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600 text-center">Total Commits</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(commits.commit_categories).map(([category, count]) => (
          <div
            key={category}
            className={`p-3 rounded-lg text-center ${categoryColors[category] || 'bg-gray-100 text-gray-800'}`}
          >
            <div className="font-bold text-lg">{count}</div>
            <div className="text-xs">{categoryLabels[category] || category}</div>
          </div>
        ))}
      </div>

      {commits.top_authors.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Top Contributors</h4>
          <div className="space-y-2">
            {commits.top_authors.slice(0, 5).map((author, index) => (
              <div key={author.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-700">{author.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {author.commit_count} commits
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitsAnalysis;
