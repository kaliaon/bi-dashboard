import { useState, useEffect } from 'react';
import { Widget, useDashboardStore } from '@/store/dashboardStore';
import { useDataStore } from '@/store/dataStore';
import { useTranslation } from 'react-i18next';

interface WidgetSettingsProps {
  widget: Widget;
  onSaved?: () => void;
}

// Default chart colors
const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function WidgetSettings({ widget, onSaved }: WidgetSettingsProps) {
  const { updateWidget } = useDashboardStore();
  const { getDataSourceById, dataSources } = useDataStore();
  const { t } = useTranslation(['dashboard', 'common']);
  
  // Local state for form values
  const [title, setTitle] = useState(widget.title);
  const [selectedDataSource, setSelectedDataSource] = useState(widget.dataSource || '');
  const [settings, setSettings] = useState({
    x: widget.config.x || '',
    y: widget.config.y || '',
    category: widget.config.category || '',
    value: widget.config.value || '',
    values: widget.config.values || [],
    xAxisLabel: widget.config.xAxisLabel || '',
    yAxisLabel: widget.config.yAxisLabel || '',
    showLegend: widget.config.showLegend !== false, // default to true if not specified
    colors: widget.config.colors || [...DEFAULT_COLORS],
    columns: widget.config.columns || [],
  });
  
  // Get the data source for this widget - it could be undefined if not set
  const dataSource = selectedDataSource ? getDataSourceById(selectedDataSource) : undefined;
  const availableColumns = dataSource?.columns || [];
  
  // Feedback state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Update local state when widget changes
  useEffect(() => {
    setTitle(widget.title);
    setSelectedDataSource(widget.dataSource || '');
    setSettings({
      x: widget.config.x || '',
      y: widget.config.y || '',
      category: widget.config.category || '',
      value: widget.config.value || '',
      values: widget.config.values || [],
      xAxisLabel: widget.config.xAxisLabel || '',
      yAxisLabel: widget.config.yAxisLabel || '',
      showLegend: widget.config.showLegend !== false,
      colors: widget.config.colors || [...DEFAULT_COLORS],
      columns: widget.config.columns || [],
    });
  }, [widget]);

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // Handle data source change
  const handleDataSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDataSource(e.target.value);
    
    // Reset chart configuration when changing data source
    setSettings({
      x: '',
      y: '',
      category: '',
      value: '',
      values: [],
      xAxisLabel: '',
      yAxisLabel: '',
      showLegend: true,
      colors: [...DEFAULT_COLORS],
      columns: [],
    });
  };

  // Handle form submission
  const handleSave = () => {
    setSaveStatus('saving');
    
    try {
      // Log the settings being saved for debugging
      console.log('Saving widget settings:', {
        id: widget.id,
        title,
        dataSource: selectedDataSource,
        config: {
          ...widget.config,
          ...settings
        }
      });
      
      updateWidget(widget.id, {
        title,
        dataSource: selectedDataSource,
        config: {
          ...widget.config,
          ...settings
        }
      });
      
      setSaveStatus('saved');
      
      // Call the onSaved callback if provided
      if (onSaved) {
        onSaved();
      }
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Error saving widget settings:', error);
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }
  };

  // Handle settings changes for dropdown selects
  const handleSettingChange = (setting: string, value: string | boolean | string[]) => {
    console.log(`Changing setting ${setting} to ${value}`);
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (setting: string, checked: boolean) => {
    handleSettingChange(setting, checked);
  };

  // Line chart specific settings
  const renderLineChartSettings = () => (
    <div className="grid grid-cols-1 gap-3 mb-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('chartSettings.xAxis')}</label>
        <select
          value={settings.x}
          onChange={(e) => handleSettingChange('x', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
          style={{color: '#111827'}}
        >
          <option value="">{t('chartSettings.selectColumn')}</option>
          {availableColumns.map(column => (
            <option key={column} value={column}>{column}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('chartSettings.yAxis')}</label>
        <select
          value={settings.y}
          onChange={(e) => handleSettingChange('y', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
          style={{color: '#111827'}}
        >
          <option value="">{t('chartSettings.selectColumn')}</option>
          {availableColumns.map(column => (
            <option key={column} value={column}>{column}</option>
          ))}
        </select>
      </div>
    </div>
  );

  // Bar chart specific settings
  const renderBarChartSettings = () => (
    <div className="grid grid-cols-1 gap-3 mb-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('chartSettings.categoryXAxis')}</label>
        <select
          value={settings.category}
          onChange={(e) => handleSettingChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
          style={{color: '#111827'}}
        >
          <option value="">{t('chartSettings.selectColumn')}</option>
          {availableColumns.map(column => (
            <option key={column} value={column}>{column}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('chartSettings.valuesYAxis')}</label>
        <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-2">
          {availableColumns.map(column => (
            <div key={column} className="flex items-center py-1">
              <input
                type="checkbox"
                id={`y-value-${column}`}
                checked={settings.values?.includes(column) || false}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  handleSettingChange('values', 
                    isChecked 
                      ? [...(settings.values || []), column] 
                      : (settings.values || []).filter((c: string) => c !== column)
                  );
                }}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
                style={{ width: 'auto', padding: '0' }}
              />
              <label htmlFor={`y-value-${column}`} className="ml-2 block text-sm text-gray-700">
                {column}
              </label>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {settings.values?.length 
            ? t('chartSettings.selectedColumns', { count: settings.values.length, total: availableColumns.length })
            : t('chartSettings.noColumnsSelected')}
        </p>
      </div>
    </div>
  );

  // Pie chart specific settings
  const renderPieChartSettings = () => (
    <div className="grid grid-cols-1 gap-3 mb-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('chartSettings.categorySlices')}</label>
        <select
          value={settings.category}
          onChange={(e) => handleSettingChange('category', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
          style={{color: '#111827'}}
        >
          <option value="">{t('chartSettings.selectColumn')}</option>
          {availableColumns.map(column => (
            <option key={column} value={column}>{column}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('chartSettings.value')}</label>
        <select
          value={settings.value}
          onChange={(e) => handleSettingChange('value', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
          style={{color: '#111827'}}
        >
          <option value="">{t('chartSettings.selectColumn')}</option>
          {availableColumns.map(column => (
            <option key={column} value={column}>{column}</option>
          ))}
        </select>
      </div>
    </div>
  );

  // Add a renderTableSettings function
  const renderTableSettings = () => (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">{t('chartSettings.columnsToDisplay')}</label>
      <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-2">
        {availableColumns.map(column => (
          <div key={column} className="flex items-center py-1">
            <input
              type="checkbox"
              id={`column-${column}`}
              checked={settings.columns?.includes(column) || false}
              onChange={(e) => {
                const isChecked = e.target.checked;
                handleSettingChange('columns', 
                  isChecked 
                    ? [...(settings.columns || []), column] 
                    : (settings.columns || []).filter((c: string) => c !== column)
                );
              }}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
              style={{ width: 'auto', padding: '0' }}
            />
            <label htmlFor={`column-${column}`} className="ml-2 block text-sm text-gray-700">
              {column}
            </label>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {settings.columns?.length 
          ? t('chartSettings.selectedColumns', { count: settings.columns.length, total: availableColumns.length })
          : t('chartSettings.noColumnsSelectedAll')}
      </p>
    </div>
  );

  // Update the renderChartSettings function
  const renderChartSettings = () => {
    switch (widget.type) {
      case 'line':
        return renderLineChartSettings();
      case 'bar':
        return renderBarChartSettings();
      case 'pie':
        return renderPieChartSettings();
      case 'table':
        return renderTableSettings();
      default:
        return <p>{t('chartSettings.noSettingsAvailable')}</p>;
    }
  };

  return (
    <div className="space-y-3 text-gray-800 overflow-hidden">
      <div className="grid grid-cols-1 gap-3">
        <div>
          <input
            id="widgetTitle"
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm form-field"
            placeholder={t('widgetSettings.widgetTitlePlaceholder')}
            style={{color: '#111827'}}
          />
        </div>
        
        <div>
          <select
            id="dataSource"
            value={selectedDataSource}
            onChange={handleDataSourceChange}
            className="w-full my-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm"
            style={{color: '#111827'}}
          >
            <option value="">{t('chartSettings.selectDataSource')}</option>
            {dataSources.map(ds => (
              <option key={ds.id} value={ds.id}>{ds.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {selectedDataSource && (
        <div className="border-t border-gray-200 pt-3 mt-3">
          <h5 className="font-medium text-gray-700 mb-3">{t('chartSettings.title')}</h5>
          {renderChartSettings()}
          
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="showLegend"
              checked={settings.showLegend}
              onChange={(e) => handleCheckboxChange('showLegend', e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
              style={{ width: 'auto', padding: '0' }}
            />
            <label htmlFor="showLegend" className="ml-2 block text-sm text-gray-700">
              {t('chartSettings.showLegend')}
            </label>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200">
        {saveStatus === 'saved' && (
          <span className="flex items-center text-green-600 text-sm mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('chartSettings.saved', { ns: 'common' })}
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="flex items-center text-red-600 text-sm mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('chartSettings.error', { ns: 'common' })}
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={`px-4 py-2 text-white rounded-md shadow-sm text-sm font-medium
            ${saveStatus === 'saving' 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
            }
          `}
        >
          {saveStatus === 'saving' ? t('app.saving', { ns: 'common' }) : t('chartSettings.saveChanges')}
        </button>
      </div>
    </div>
  );
} 