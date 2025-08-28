/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import axios from 'axios';
import SearchForm from './components/SearchForm';
import RepositoryCard from './components/RepositoryCard';
import LanguagesChart from './components/LanguagesChart';
import CommitsAnalysis from './components/CommitsAnalysis';
import DependenciesTable from './components/DependenciesTable';
import ProjectStructure from './components/ProjectStructure';
import CodeViewer from './components/CodeViewer';
import type { RepoAnalysis } from './types/api';

const App: React.FC = () => {
  const [data, setData] = useState<RepoAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);

  /**
   * Extract owner and repo name from GitHub URL or return input as-is if it's already in owner/repo format
   * @param input - GitHub URL or owner/repo string
   * @returns object with owner and repo properties, or null if invalid
   */
  const extractRepoInfo = (input: string): { owner: string; repo: string } | null => {
    const trimmedInput = input.trim();
    
    if (!trimmedInput) return null;

    // Check if it's already in owner/repo format
    if (!trimmedInput.includes('http') && trimmedInput.includes('/')) {
      const parts = trimmedInput.split('/');
      if (parts.length === 2 && parts[0] && parts[1]) {
        return {
          owner: parts[0],
          repo: parts[1]
        };
      }
    }

    // Extract from various GitHub URL formats
    const githubUrlPatterns = [
      // Standard GitHub URLs
      /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})\/([a-zA-Z0-9._-]+)(?:\.git)?(?:\/.*)?$/i,
      
      // Git clone URLs
      /git@github\.com:([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})\/([a-zA-Z0-9._-]+)(?:\.git)?$/i
    ];

    for (const pattern of githubUrlPatterns) {
      const match = trimmedInput.match(pattern);
      if (match && match[1] && match[2]) {
        return {
          owner: match[1],
          repo: match[2].replace(/\.git$/, '') // Remove .git extension if present
        };
      }
    }

    return null;
  };

  /**
   * Validate GitHub repository format
   * @param owner - Repository owner
   * @param repo - Repository name
   * @returns boolean indicating if the format is valid
   */
  const isValidRepoFormat = (owner: string, repo: string): boolean => {
    // GitHub username/organization validation
    const usernamePattern = /^[a-zA-Z0-9]([a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
    
    // GitHub repository name validation (more permissive)
    const repoPattern = /^[a-zA-Z0-9._-]+$/;
    
    return usernamePattern.test(owner) && repoPattern.test(repo) && repo.length <= 100;
  };

  const handleSearch = async (input: string) => {
    const repoInfo = extractRepoInfo(input);
    
    if (!repoInfo) {
      setError('Invalid GitHub repository format. Please enter a valid GitHub URL or owner/repo format.');
      return;
    }

    const { owner, repo } = repoInfo;

    if (!isValidRepoFormat(owner, repo)) {
      setError('Invalid repository format. Please check the owner and repository names.');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);
    setTreeData([]);

    try {
      const [response, treeResponse] = await Promise.all([
      axios.get<RepoAnalysis>(`${import.meta.env.VITE_BASE_URL}/analyze/${owner}/${repo}`),
      axios.get(`${import.meta.env.VITE_BASE_URL}/tree/${owner}/${repo}`)
    ]);
    
    setData(response.data);
    setTreeData(treeResponse.data.tree || []);
    setFiles(treeResponse.data.tree || []);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        'Failed to fetch repository data. Please check the repository name and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <SearchForm onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-8">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {data && (
          <div className="space-y-8">
            <RepositoryCard repository={data.repository} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <LanguagesChart languages={data.languages} />
              <CommitsAnalysis commits={data.commits} />
            </div>

            <DependenciesTable dependencies={data.dependencies} />

            <ProjectStructure 
              tree={treeData} 
              repoName={data.repository.name}
            />

            <CodeViewer 
              owner={data.repository.full_name.split('/')[0]} 
              repo={data.repository.name}
              files={files}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">File Structure</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {data.file_structure.file_count.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-800">Files</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {data.file_structure.directory_count.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-800">Directories</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(data.file_structure.file_types)
                    .slice(0, 8)
                    .map(([ext, count]) => (
                      <div key={ext} className="flex justify-between items-center">
                        <span className="text-sm font-medium">.{ext}</span>
                        <span className="text-sm text-gray-600">{count} files</span>
                      </div>
                    ))}
                </div>
              </div>

              {data.readme_analysis && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">README Analysis</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {data.readme_analysis.word_count.toLocaleString()}
                      </div>
                      <div className="text-sm text-purple-800">Words</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {data.readme_analysis.header_count}
                      </div>
                      <div className="text-sm text-yellow-800">Headers</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(data.readme_analysis.sections).map(([section, present]) => (
                      <div key={section} className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">{section}</span>
                        <span className={`text-sm ${present ? 'text-green-600' : 'text-gray-400'}`}>
                          {present ? '✓' : '✗'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!data && !loading && !error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Analyze Any GitHub Repository
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Get comprehensive insights including commit patterns, language breakdown, 
              dependencies, and code quality metrics for any public GitHub repository.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
