/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

interface TreeNode {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
}

interface ProjectStructureProps {
  tree: TreeNode[];
  repoName: string;
}

const ProjectStructure: React.FC<ProjectStructureProps> = ({ tree, repoName }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['']));
  const [copySuccess, setCopySuccess] = useState<string>('');

  // Build tree structure from flat array
  const buildTree = (nodes: TreeNode[]) => {
    const root: any = { children: {} };
    
    nodes.forEach(node => {
      const parts = node.path.split('/');
      let current = root;
      
      parts.forEach((part, index) => {
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            type: index === parts.length - 1 ? node.type : 'tree',
            size: node.size,
            children: {}
          };
        }
        current = current.children[part];
      });
    });
    
    return root.children;
  };

  // Generate tree structure as text with proper indentation
  const generateTreeText = () => {
    const treeStructure = buildTree(tree);
    const rootNodes = Object.values(treeStructure) as any[];
    let result = `${repoName}/\n`;

    const renderNodeAsText = (node: any, depth: number, isLast: boolean, prefix: string): string => {
      const children = Object.values(node.children) as any[];
      const sortedChildren = children.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'tree' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      let nodeText = '';
      const connector = isLast ? '└── ' : '├── ';
      const folderSuffix = node.type === 'tree' ? '/' : '';
      
      nodeText += `${prefix}${connector}${node.name}${folderSuffix}\n`;

      if (sortedChildren.length > 0) {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        
        sortedChildren.forEach((child, index) => {
          const isChildLast = index === sortedChildren.length - 1;
          nodeText += renderNodeAsText(child, depth + 1, isChildLast, newPrefix);
        });
      }

      return nodeText;
    };

    const sortedRootNodes = rootNodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'tree' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    sortedRootNodes.forEach((node, index) => {
      const isLast = index === sortedRootNodes.length - 1;
      result += renderNodeAsText(node, 0, isLast, '');
    });

    return result;
  };

  const copyTreeStructure = async () => {
    try {
      const treeText = generateTreeText();
      await navigator.clipboard.writeText(treeText);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (filename: string, type: string) => {
    if (type === 'tree') return '📁';
    
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      'js': '🟨', 'jsx': '🟨', 'ts': '🔷', 'tsx': '🔷',
      'py': '🐍', 'java': '☕', 'cpp': '⚙️', 'c': '⚙️',
      'html': '🌐', 'css': '🎨', 'scss': '🎨', 'sass': '🎨',
      'json': '📄', 'xml': '📄', 'yml': '📄', 'yaml': '📄',
      'md': '📝', 'txt': '📄', 'pdf': '📕',
      'png': '🖼️', 'jpg': '🖼️', 'jpeg': '🖼️', 'gif': '🖼️', 'svg': '🖼️',
      'mp4': '🎥', 'avi': '🎥', 'mov': '🎥',
      'mp3': '🎵', 'wav': '🎵', 'flac': '🎵',
      'zip': '📦', 'tar': '📦', 'gz': '📦', 'rar': '📦',
      'git': '🔧', 'gitignore': '🚫', 'env': '🔒',
      'dockerfile': '🐳', 'docker': '🐳',
      'lock': '🔒', 'config': '⚙️'
    };
    
    return iconMap[ext || ''] || '📄';
  };

  const renderTree = (node: any, depth = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const children = Object.values(node.children) as any[];
    const hasChildren = children.length > 0;

    return (
      <div key={node.path}>
        <div 
          className={`flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => node.type === 'tree' && toggleFolder(node.path)}
        >
          {node.type === 'tree' && hasChildren && (
            <span className="mr-1 text-gray-500 text-xs">
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          <span className="mr-2">{getFileIcon(node.name, node.type)}</span>
          <span className="text-sm font-medium text-gray-700 flex-1">{node.name}</span>
          {node.size && (
            <span className="text-xs text-gray-500">
              {(node.size / 1024).toFixed(1)}KB
            </span>
          )}
        </div>
        
        {node.type === 'tree' && isExpanded && children.length > 0 && (
          <div>
            {children
              .sort((a, b) => {
                // Folders first, then files
                if (a.type !== b.type) {
                  return a.type === 'tree' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
              })
              .map(child => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const treeStructure = buildTree(tree);
  const rootNodes = Object.values(treeStructure) as any[];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Project Structure</h3>
        <div className="flex gap-2">
          <button
            onClick={copyTreeStructure}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              copySuccess === 'Copied!' 
                ? 'bg-green-100 text-green-700' 
                : copySuccess === 'Failed to copy'
                ? 'bg-red-100 text-red-700'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            {copySuccess || (
              <div className="flex items-center gap-1">
                <span>📋</span>
                Copy Structure
              </div>
            )}
          </button>
          <button
            onClick={() => setExpandedFolders(new Set(tree.filter(t => t.type === 'tree').map(t => t.path)))}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Expand All
          </button>
          <button
            onClick={() => setExpandedFolders(new Set(['']))}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Collapse All
          </button>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
        <div className="font-bold text-gray-800 mb-2 flex items-center">
          <span className="mr-2">📁</span>
          {repoName}
        </div>
        
        {rootNodes.length > 0 ? (
          <div>
            {rootNodes
              .sort((a, b) => {
                if (a.type !== b.type) {
                  return a.type === 'tree' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
              })
              .map(node => renderTree(node, 0))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No files found or repository is empty.</p>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>📁 = Folder, 📄 = File, 🟨 = JavaScript, 🔷 = TypeScript, 🐍 = Python, etc.</p>
        <p>Click "Copy Structure" to copy the tree structure in text format.</p>
      </div>
    </div>
  );
};

export default ProjectStructure;
