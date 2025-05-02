import React, { useState } from 'react';
import Modal from '@/components/Modal';
import { useDashboardStore, WidgetType } from '@/store/dashboardStore';
import { nanoid } from 'nanoid';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

export default function AddWidgetModal({ isOpen, onClose, position }: AddWidgetModalProps) {
  const [selectedType, setSelectedType] = useState<WidgetType | ''>('');
  const { addWidget } = useDashboardStore();

  const handleTypeSelect = (type: WidgetType) => {
    setSelectedType(type);
  };

  const handleAddWidget = () => {
    if (!selectedType) return;

    // Create a default widget based on the selected type
    const newWidget = {
      id: nanoid(),
      type: selectedType,
      title: selectedType.charAt(0).toUpperCase() + selectedType.slice(1) + ' Widget',
      dataSource: '',
      config: {},
      layout: {
        x: position?.x || 0,
        y: position?.y || 0,
        w: 6,
        h: 5
      }
    };

    addWidget(newWidget);
    setSelectedType('');
    onClose();
  };

  const widgetTypes = [
    { id: 'line' as WidgetType, name: 'Line Chart', description: 'Show trends over time' },
    { id: 'bar' as WidgetType, name: 'Bar Chart', description: 'Compare values across categories' },
    { id: 'pie' as WidgetType, name: 'Pie Chart', description: 'Show proportion of a whole' },
    { id: 'table' as WidgetType, name: 'Table', description: 'Display tabular data' },
    { id: 'text' as WidgetType, name: 'Text Widget', description: 'Display formatted text' },
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
                  : 'border-gray-200 hover:bg-blue-50'
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
            className="px-4 py-2 mr-2 border border-blue-200 text-blue-600 rounded-md hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Cancel
          </button>
          <button
            onClick={handleAddWidget}
            disabled={!selectedType}
            className={`px-4 py-2 rounded-md text-white ${
              selectedType ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-blue-200`}
          >
            Add Widget
          </button>
        </div>
      </div>
    </Modal>
  );
} 