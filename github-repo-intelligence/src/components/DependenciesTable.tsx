import React from 'react';
import type { Dependencies } from '../types/api';

interface DependenciesTableProps {
  dependencies: Dependencies;
}

const DependenciesTable: React.FC<DependenciesTableProps> = ({ dependencies }) => {
  if (dependencies.total_dependencies === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Dependencies</h3>
        <p className="text-gray-600">No dependencies found in this repository.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Dependencies</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{dependencies.total_dependencies}</div>
          <div className="text-sm text-blue-800">Total Dependencies</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{dependencies.package_managers.length}</div>
          <div className="text-sm text-green-800">Package Managers</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {Object.keys(dependencies.dev_dependencies).length}
          </div>
          <div className="text-sm text-purple-800">Dev Dependencies</div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(dependencies.dependencies).map(([manager, deps]) => (
          <div key={manager} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h4 className="font-semibold text-gray-900">{manager}</h4>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(deps).map(([pkg, version]) => (
                  <div key={pkg} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700 truncate">{pkg}</span>
                    <span className="text-xs text-gray-500 ml-2">{version}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DependenciesTable;
