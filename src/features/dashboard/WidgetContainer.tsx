import { useRef } from 'react';
import { Widget } from '@/store/dashboardStore';
import LineChartWidget from '@/features/charts/LineChartWidget';
import BarChartWidget from '@/features/charts/BarChartWidget';
import PieChartWidget from '@/features/charts/PieChartWidget';
import TableChartWidget from '@/features/charts/TableChartWidget';
import { useDataStore } from '@/store/dataStore';
import { useModalStore } from '@/store/modalStore';
import { useTranslation } from 'react-i18next';

interface WidgetContainerProps {
  widget: Widget;
  isEditing: boolean;
  onDelete?: () => void;
}

export default function WidgetContainer({ widget, isEditing, onDelete }: WidgetContainerProps) {
  const { t } = useTranslation(['dashboard', 'common']);
  const { getDataSourceById } = useDataStore();
  const { openWidgetSettings } = useModalStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get data source for this widget
  const dataSource = widget.dataSource 
    ? getDataSourceById(widget.dataSource) 
    : undefined;
  
  // Determine what content to display based on widget type
  const renderContent = () => {
    if (!dataSource && widget.type !== 'text') {
      return (
        <div className="h-full flex items-center justify-center text-gray-500">
          <p>{t('widgetSettings.noDataSource')}</p>
        </div>
      );
    }

    switch (widget.type) {
      case 'line':
        return <LineChartWidget widget={widget} />;
      case 'bar':
        return <BarChartWidget widget={widget} />;
      case 'pie':
        return <PieChartWidget widget={widget} />;
      case 'table':
        return <TableChartWidget widget={widget} />;
      case 'text':
        return (
          <div className="p-4 h-full overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: widget.config.content || t('noContent') }} />
          </div>
        );
      default:
        return <div>{t('unknownWidgetType')}</div>;
    }
  };

  // Handle opening settings with stopPropagation to prevent drag
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event from bubbling up to drag handlers
    openWidgetSettings(widget);
  };

  // Handle delete with stopPropagation to prevent drag
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event from bubbling up to drag handlers
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div ref={containerRef} className="relative bg-white rounded-lg shadow-md flex flex-col h-full w-full overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 border-b bg-gray-50">
        {/* Add a separate drag handle area to allow dragging from the title area only */}
        <h3 className="font-medium truncate widget-drag-handle flex-grow cursor-move">
          {widget.title}
        </h3>
        
        {isEditing && (
          <div 
            className="flex space-x-2"
            onClick={(e) => e.stopPropagation()} // Stop event bubbling for the button container
          >
            <button
              onClick={handleSettingsClick}
              className="px-2 py-1 text-sm font-medium rounded border shadow-sm bg-white text-blue-600 hover:bg-blue-50 border-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-200"
            >
              {t('widgetActions.edit')}
            </button>
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                className="px-2 py-1 text-sm font-medium rounded border shadow-sm bg-white text-red-600 hover:bg-red-50 border-red-200 focus:outline-none focus:ring-1 focus:ring-red-200"
              >
                {t('widgetActions.delete')}
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="flex-grow">
        {renderContent()}
      </div>
    </div>
  );
} 