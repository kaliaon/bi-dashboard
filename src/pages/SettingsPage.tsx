import { useState } from 'react';
import { exportDashboard } from '@/services/storageService';
import { useDashboardStore } from '@/store/dashboardStore';
import { useDataStore } from '@/store/dataStore';

export default function SettingsPage() {
  const { widgets } = useDashboardStore();
  const { dataSources } = useDataStore();
  
  const [dashboardName, setDashboardName] = useState('My Dashboard');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [theme, setTheme] = useState('light');
  
  const handleExport = () => {
    try {
      exportDashboard(dashboardName, widgets, dataSources);
      setExportSuccess(true);
      
      // Reset the success message after 3 seconds
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error exporting dashboard:', error);
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all dashboard data? This action cannot be undone.')) {
      // This would typically trigger actions to clear your stores
      // For now, just reload the page to reset the stored data
      window.localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-4 border-b">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500">Configure your dashboard settings</p>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          {exportSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">
                Dashboard exported successfully!
              </p>
            </div>
          )}
          
          <div className="space-y-8">
            {/* Dashboard Settings */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Dashboard Settings</h2>
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="mb-4">
                  <label htmlFor="dashboard-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Dashboard Name
                  </label>
                  <input
                    type="text"
                    id="dashboard-name"
                    value={dashboardName}
                    onChange={(e) => setDashboardName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                    Theme
                  </label>
                  <select
                    id="theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Export/Import */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Export/Import</h2>
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-gray-600 mb-4">
                  Export your dashboard configuration to a file that you can import later or share with others.
                </p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Export Dashboard
                  </button>
                  
                  <label className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                    Import Dashboard
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={() => {}}
                    />
                  </label>
                </div>
              </div>
            </div>
            
            {/* Danger Zone */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
              <div className="bg-red-50 p-6 rounded-lg border border-red-200 shadow-sm">
                <p className="text-gray-700 mb-4">
                  These actions are destructive and cannot be undone. Please be careful.
                </p>
                
                <button
                  onClick={handleClearData}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 