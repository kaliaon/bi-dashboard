import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import DashboardGrid from '@/features/dashboard/DashboardGrid';
import { useDashboardStore, Widget, WidgetType } from '@/store/dashboardStore';
import { useDataStore } from '@/store/dataStore';
import { exportDashboard, importDashboard } from '@/services/storageService';
import GlobalWidgetSettingsModal from '@/features/dashboard/GlobalWidgetSettingsModal';
import Modal from '@/components/Modal';

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
          
        </div>
      </div>
      
      {/* Main dashboard */}
      <div className="flex-1 w-full">
        <DashboardGrid />
      </div>
      
      {/* Add widget modal using our new Modal component */}
      <Modal
        isOpen={isAddingWidget}
        onClose={() => setIsAddingWidget(false)}
        title="Add New Widget"
        width="w-[400px]"
        disableScroll={true}
      >
        <div className="space-y-6 overflow-hidden">
          <div>
            {/* <label htmlFor="widget-title" className="block text-sm font-medium text-gray-700 mb-1">
              Widget Title
            </label> */}
            <input
              type="text"
              id="widget-title"
              value={newWidgetTitle}
              onChange={(e) => setNewWidgetTitle(e.target.value)}
              className="w-full my-[10px] border border-gray-300 rounded-md shadow-sm form-field"
              placeholder="Widget Title"
              style={{color: '#111827'}}
            />
          </div>
          
          <div>
            {/* <label htmlFor="widget-type" className="block text-sm font-medium text-gray-700 mb-1">
              Widget Type
            </label> */}
            <select
              id="widget-type"
              value={newWidgetType}
              onChange={(e) => setNewWidgetType(e.target.value as WidgetType)}
              className="w-full my-[10px] border border-gray-300 rounded-md shadow-sm"
              style={{color: '#111827'}}
            >
              <option value="" disabled>Widget Type</option>
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="table">Data Table</option>
            </select>
          </div>
          
          <div>
            {/* <label htmlFor="data-source" className="block text-sm font-medium text-gray-700 mb-1">
              Data Source
            </label> */}
            <select
              id="data-source"
              value={selectedDataSource}
              onChange={(e) => setSelectedDataSource(e.target.value)}
              className="w-full my-[10px] border border-gray-300 rounded-md shadow-sm"
              style={{color: '#111827'}}
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
        
        <div className="mt-6 flex justify-between space-x-2">
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
      </Modal>
      
      {/* Global widget settings modal */}
      <GlobalWidgetSettingsModal />
    </div>
  );
} 