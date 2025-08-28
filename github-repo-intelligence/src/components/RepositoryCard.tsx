import React from 'react';
import type { Repository } from '../types/api';

interface RepositoryCardProps {
  repository: Repository;
}

const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{repository.name}</h2>
          <p className="text-gray-600 text-sm">{repository.full_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <span className="font-bold text-yellow-600">{formatNumber(repository.stars)}</span>
        </div>
      </div>

      {repository.description && (
        <p className="text-gray-700 mb-4 leading-relaxed">{repository.description}</p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{formatNumber(repository.forks)}</div>
          <div className="text-xs text-blue-800">Forks</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{formatNumber(repository.watchers)}</div>
          <div className="text-xs text-green-800">Watchers</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{repository.open_issues}</div>
          <div className="text-xs text-red-800">Open Issues</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-xl font-bold text-purple-600">{repository.language || 'N/A'}</div>
          <div className="text-xs text-purple-800">Language</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <div>
          <span className="font-medium">Created:</span> {formatDate(repository.created_at)}
        </div>
        <div>
          <span className="font-medium">Updated:</span> {formatDate(repository.updated_at)}
        </div>
        <div>
          <span className="font-medium">Branch:</span> {repository.default_branch}
        </div>
        {repository.license && (
          <div>
            <span className="font-medium">License:</span> {repository.license}
          </div>
        )}
      </div>
    </div>
  );
};

export default RepositoryCard;
