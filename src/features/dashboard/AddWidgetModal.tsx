import React, { useState } from 'react';
import Modal from '@/components/Modal';
import { useDashboardStore } from '@/store/dashboardStore';
import { nanoid } from 'nanoid';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

export default function AddWidgetModal({ isOpen, onClose, position }: AddWidgetModalProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const { addWidget } = useDashboardStore();

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  const handleAddWidget = () => {
    if (!selectedType) return;

    // Create a default widget based on the selected type
    const newWidget = {
      id: nanoid(),
      type: selectedType,
      title: selectedType.charAt(0).toUpperCase() + selectedType.slice(1) + ' Widget',
      x: position?.x || 0,
      y: position?.y || 0,
      width: 6,
      height: 5,
      dataSource: '',
      config: {}
    };

    addWidget(newWidget);
    setSelectedType('');
    onClose();
  };

  const widgetTypes = [
    { id: 'line', name: 'Line Chart', description: 'Show trends over time' },
    { id: 'bar', name: 'Bar Chart', description: 'Compare values across categories' },
    { id: 'pie', name: 'Pie Chart', description: 'Show proportion of a whole' },
    { id: 'table', name: 'Table', description: 'Display tabular data' },
    { id: 'kpi', name: 'KPI Card', description: 'Show a key performance indicator' },
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add Widget" 
      disableScroll={true}
      width="w-[400px]"
    >
      <div className="flex flex-col space-y-4 h-full overflow-hidden px-2">
        <p className="text-gray-600">Select a widget type to add to your dashboard:</p>
        
        <div className="flex flex-col space-y-2 overflow-hidden">
          {widgetTypes.map((type) => (
            <div
              key={type.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedType === type.id
                  ? 'bg-blue-50 border-blue-500'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleTypeSelect(type.id)}
            >
              <div className="font-medium">{type.name}</div>
              <div className="text-sm text-gray-600">{type.description}</div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 mr-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddWidget}
            disabled={!selectedType}
            className={`px-4 py-2 rounded-md text-white ${
              selectedType ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'
            }`}
          >
            Add Widget
          </button>
        </div>
      </div>
    </Modal>
  );
} 