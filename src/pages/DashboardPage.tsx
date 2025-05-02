import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import DashboardGrid from '@/features/dashboard/DashboardGrid';
import { useDashboardStore, Widget, WidgetType } from '@/store/dashboardStore';
import { useDataStore } from '@/store/dataStore';
import { exportDashboard, ExportFormat } from '@/services/storageService';
import GlobalWidgetSettingsModal from '@/features/dashboard/GlobalWidgetSettingsModal';
import Modal from '@/components/Modal';

export default function DashboardPage() {
  const { widgets, addWidget } = useDashboardStore();
  const { dataSources } = useDataStore();
  const { t } = useTranslation(['dashboard', 'common']);
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [newWidgetType, setNewWidgetType] = useState<WidgetType>('line');
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close the export dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportOptions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleExportDashboard = (format: ExportFormat = 'json') => {
    setIsExporting(true);
    setExportSuccess(null);
    
    // Dashboard name could be dynamic, but using static for simplicity
    const dashboardName = t('defaultDashboardName', 'My Dashboard');
    
    exportDashboard(dashboardName, widgets, dataSources, format)
      .then(() => {
        setExportSuccess(t('export.success', { format: format.toUpperCase(), ns: 'common' }));
        // Hide the success message after 3 seconds
        setTimeout(() => {
          setExportSuccess(null);
        }, 3000);
      })
      .catch((error) => {
        console.error(`Error exporting dashboard as ${format}:`, error);
        setExportSuccess(t('export.error', { format, message: error.message, ns: 'common' }));
      })
      .finally(() => {
        setIsExporting(false);
        setShowExportOptions(false);
      });
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top toolbar */}
      <div className="bg-white shadow-sm p-3 flex justify-between items-center">
        <div>
          <button
            onClick={() => setIsAddingWidget(true)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {t('addWidget')}
          </button>
        </div>
        <div className="flex space-x-2 relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="px-3 py-1.5 border border-blue-200 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            disabled={isExporting}
          >
            {isExporting ? t('export.exporting', { ns: 'common' }) : t('export.title', { ns: 'common' })}
          </button>
          
          {/* Export options dropdown */}
          {showExportOptions && (
            <div className="absolute top-full right-0 mt-1 bg-white shadow-lg rounded-md border border-gray-200 z-111111 w-48">
              <ul className="py-1">
                <li>
                  <button
                    onClick={() => handleExportDashboard('json')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    {t('export.options.json', { ns: 'common' })}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleExportDashboard('pdf')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    {t('export.options.pdf', { ns: 'common' })}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleExportDashboard('image')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    {t('export.options.image', { ns: 'common' })}
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Export success message */}
      {exportSuccess && (
        <div className="bg-green-50 border-b border-green-100 p-2 text-sm text-green-800">
          {exportSuccess}
        </div>
      )}
      
      {/* Main dashboard */}
      <div className="flex-1 w-full">
        <DashboardGrid />
      </div>
      
      {/* Add widget modal using our new Modal component */}
      <Modal
        isOpen={isAddingWidget}
        title={t('widgetSettings.title')}
        onClose={() => setIsAddingWidget(false)}
      >
        <div className="p-6">
          <div className="mb-4">
            <label htmlFor="widget-title" className="block text-sm font-medium text-gray-700 mb-1">
              {t('widgetSettings.widgetTitle')}
            </label>
            <input
              type="text"
              id="widget-title"
              value={newWidgetTitle}
              onChange={(e) => setNewWidgetTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('widgetSettings.widgetTitlePlaceholder')}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="widget-type" className="block text-sm font-medium text-gray-700 mb-1">
              {t('widgetSettings.widgetType')}
            </label>
            <select
              id="widget-type"
              value={newWidgetType}
              onChange={(e) => setNewWidgetType(e.target.value as WidgetType)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="line">{t('widgetSettings.types.line')}</option>
              <option value="bar">{t('widgetSettings.types.bar')}</option>
              <option value="pie">{t('widgetSettings.types.pie')}</option>
              <option value="table">{t('widgetSettings.types.table')}</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label htmlFor="data-source" className="block text-sm font-medium text-gray-700 mb-1">
              {t('widgetSettings.dataSource')}
            </label>
            <select
              id="data-source"
              value={selectedDataSource}
              onChange={(e) => setSelectedDataSource(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('widgetSettings.noDataSource')}</option>
              {dataSources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsAddingWidget(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('app.cancel', { ns: 'common' })}
            </button>
            <button
              onClick={handleAddWidget}
              disabled={!newWidgetTitle}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                !newWidgetTitle
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {t('app.add', { ns: 'common' })}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Global widget settings modal */}
      <GlobalWidgetSettingsModal />
    </div>
  );
} 