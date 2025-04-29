import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import DashboardGrid from '@/features/dashboard/DashboardGrid';
import { useDashboardStore, Widget, WidgetType } from '@/store/dashboardStore';
import { useDataStore } from '@/store/dataStore';
import { exportDashboard, importDashboard } from '@/services/storageService';

export default function DashboardPage() {
  const { widgets, addWidget } = useDashboardStore();
  const { dataSources } = useDataStore();
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [newWidgetType, setNewWidgetType] = useState<WidgetType>('line');
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');

  const handleAddWidget = () => {
    if (!newWidgetTitle) return;
    
    const newWidget: Widget = {
      id: uuidv4(),
      type: newWidgetType,
      title: newWidgetTitle,
      dataSource: selectedDataSource || undefined,
      config: {
        // Default configs based on widget type
        ...(newWidgetType === 'line' ? { x: '', y: '' } : {}),
        ...(newWidgetType === 'bar' ? { category: '', values: [] } : {}),
        ...(newWidgetType === 'pie' ? { category: '', value: '' } : {}),
        ...(newWidgetType === 'table' ? { columns: [] } : {}),
      },
      layout: {
        x: 0,
        y: 0,
        w: 6,
        h: 4,
      },
    };
    
    addWidget(newWidget);
    setIsAddingWidget(false);
    setNewWidgetTitle('');
    setNewWidgetType('line');
    setSelectedDataSource('');
  };

  const handleExportDashboard = () => {
    exportDashboard('My Dashboard', widgets, dataSources);
  };

  const handleImportDashboard = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    try {
      const dashboardData = await importDashboard(files[0]);
      
      // You would typically dispatch actions to update your store here
      // This is just a placeholder for now
      console.log('Imported dashboard:', dashboardData);
      
      // Reset the input
      event.target.value = '';
    } catch (error) {
      console.error('Error importing dashboard:', error);
      alert('Failed to import dashboard file. Please check the file format.');
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top toolbar */}
      <div className="bg-white shadow-sm p-3 flex justify-between items-center">
        <div>
          <button
            onClick={() => setIsAddingWidget(true)}
            className="px-3 py-1 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
          >
            Add Widget
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExportDashboard}
            className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
          >
            Export
          </button>
          <label className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer text-sm">
            Import
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportDashboard}
            />
          </label>
        </div>
      </div>
      
      {/* Main dashboard */}
      <div className="flex-1 w-full">
        <DashboardGrid />
      </div>
      
      {/* Add widget modal */}
      {isAddingWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Add New Widget</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="widget-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Widget Title
                  </label>
                  <input
                    type="text"
                    id="widget-title"
                    value={newWidgetTitle}
                    onChange={(e) => setNewWidgetTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter widget title"
                  />
                </div>
                
                <div>
                  <label htmlFor="widget-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Widget Type
                  </label>
                  <select
                    id="widget-type"
                    value={newWidgetType}
                    onChange={(e) => setNewWidgetType(e.target.value as WidgetType)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="line">Line Chart</option>
                    <option value="bar">Bar Chart</option>
                    <option value="pie">Pie Chart</option>
                    <option value="table">Data Table</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="data-source" className="block text-sm font-medium text-gray-700 mb-1">
                    Data Source
                  </label>
                  <select
                    id="data-source"
                    value={selectedDataSource}
                    onChange={(e) => setSelectedDataSource(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a data source</option>
                    {dataSources.map((ds) => (
                      <option key={ds.id} value={ds.id}>
                        {ds.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-2 rounded-b-lg">
              <button
                onClick={() => setIsAddingWidget(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWidget}
                disabled={!newWidgetTitle}
                className={`px-4 py-2 rounded-md text-white ${
                  !newWidgetTitle ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
                }`}
              >
                Add Widget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 