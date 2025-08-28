/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import axios from 'axios';

interface CodeViewerProps {
  owner: string;
  repo: string;
  files: Array<{ path: string; type: string }>;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ owner, repo, files }) => {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchFileContent = async (filePath: string) => {
    if (!filePath) return;
    
    setLoading(true);
    setError('');
    setSelectedFile(filePath);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/file-content/${owner}/${repo}`,
        { params: { path: filePath } }
      );
      setFileContent(response.data.content);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch file content');
      setFileContent('');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      'js': '🟨', 'jsx': '🟨', 'ts': '🔷', 'tsx': '🔷',
      'py': '🐍', 'java': '☕', 'cpp': '⚙️', 'c': '⚙️',
      'html': '🌐', 'css': '🎨', 'json': '📄', 'md': '📝',
      'txt': '📄', 'yml': '📄', 'yaml': '📄', 'xml': '📄'
    };
    return iconMap[ext || ''] || '📄';
  };

  const getLanguageForSyntaxHighlighting = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap: { [key: string]: string } = {
      'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
      'py': 'python', 'java': 'java', 'cpp': 'cpp', 'c': 'c',
      'html': 'html', 'css': 'css', 'json': 'json', 'md': 'markdown',
      'yml': 'yaml', 'yaml': 'yaml', 'xml': 'xml', 'sql': 'sql'
    };
    return langMap[ext || ''] || 'text';
  };

  // Filter only code files (exclude binary files, images, etc.)
  const codeFiles = files.filter(file => 
    file.type === 'blob' && 
    !file.path.includes('.git/') &&
    !/\.(png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz|exe|dll|so|dylib)$/i.test(file.path)
  ).slice(0, 50); // Limit to first 50 files

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Code Viewer</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File List */}
        <div className="lg:col-span-1">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Files ({codeFiles.length})</h4>
          <div className="max-h-64 overflow-y-auto border rounded-lg">
            {codeFiles.map((file) => (
              <button
                key={file.path}
                onClick={() => fetchFileContent(file.path)}
                className={`w-full text-left p-2 text-sm hover:bg-gray-100 border-b border-gray-100 flex items-center gap-2 ${
                  selectedFile === file.path ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <span>{getFileIcon(file.path)}</span>
                <span className="truncate">{file.path.split('/').pop()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Code Content */}
        <div className="lg:col-span-2">
          {selectedFile && (
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">
                {getFileIcon(selectedFile)} {selectedFile}
              </h4>
              <span className="text-xs text-gray-500">
                {getLanguageForSyntaxHighlighting(selectedFile)}
              </span>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading file content...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {fileContent && !loading && (
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96 text-sm">
                <code>{fileContent}</code>
              </pre>
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => navigator.clipboard.writeText(fileContent)}
                  className="px-2 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {!selectedFile && !loading && (
            <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Select a file to view its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;
