import { useState } from 'react';
import { Widget, useDashboardStore } from '@/store/dashboardStore';
import LineChartWidget from '@/features/charts/LineChartWidget';
import BarChartWidget from '@/features/charts/BarChartWidget';
import PieChartWidget from '@/features/charts/PieChartWidget';
import DataTableWidget from '@/features/data/DataTableWidget';

interface WidgetContainerProps {
  widget: Widget;
  isEditing: boolean;
}

export default function WidgetContainer({ 
  widget, 
  isEditing 
}: WidgetContainerProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { removeWidget, setActiveWidget } = useDashboardStore();

  const handleWidgetClick = () => {
    if (isEditing) {
      setActiveWidget(widget.id);
    }
  };

  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'line':
        return <LineChartWidget widget={widget} />;
      case 'bar':
        return <BarChartWidget widget={widget} />;
      case 'pie':
        return <PieChartWidget widget={widget} />;
      case 'table':
        return <DataTableWidget widget={widget} />;
      default:
        return <div className="p-4">Unknown widget type</div>;
    }
  };

  return (
    <div 
      className={`flex flex-col h-full bg-white border rounded-lg shadow-sm overflow-hidden
        ${isEditing ? 'border-blue-500 cursor-move' : 'border-gray-200'}
      `}
      onClick={handleWidgetClick}
    >
      <div className="flex justify-between items-center px-4 py-2 border-b bg-gray-50">
        <h3 className="font-medium truncate">{widget.title}</h3>
        
        <div className="p-1 absolute top-2 right-2 flex space-x-2 bg-white/80 backdrop-blur-sm rounded shadow-sm">
          {isEditing && (
            <>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded"
                aria-label="Edit widget settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <button
                onClick={() => removeWidget(widget.id)}
                className="text-gray-500 hover:text-red-500 p-1 rounded"
                aria-label="Remove widget"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {renderWidgetContent()}
      </div>
      
      {isSettingsOpen && isEditing && (
        <div className="p-4 border-t">
          <h4 className="font-medium mb-2">Widget Settings</h4>
          {/* Widget settings would go here */}
          {/* This would include data source selection, chart options, etc. */}
          <p className="text-sm text-gray-500">
            Settings panel for {widget.title}
          </p>
        </div>
      )}
    </div>
  );
} 