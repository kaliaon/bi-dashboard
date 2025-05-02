import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { exportDashboard, ExportFormat } from '@/services/storageService';
import { useDashboardStore } from '@/store/dashboardStore';
import { useDataStore } from '@/store/dataStore';

export default function SettingsPage() {
  const { widgets } = useDashboardStore();
  const { dataSources } = useDataStore();
  const { t, i18n } = useTranslation(['settings', 'common']);
  
  const [dashboardName, setDashboardName] = useState('My Dashboard');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [exportStatus, setExportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [language, setLanguage] = useState(i18n.language || 'en');
  
  // Update language when selector changes
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);
  
  const handleExport = () => {
    setIsExporting(true);
    setExportStatus(null);
    
    exportDashboard(dashboardName, widgets, dataSources, exportFormat)
      .then(() => {
        setExportStatus({
          success: true,
          message: t('export.success', { format: exportFormat.toUpperCase(), ns: 'common' })
        });
        
        // Reset the success message after 3 seconds
        setTimeout(() => {
          setExportStatus(null);
        }, 3000);
      })
      .catch((error) => {
        console.error(`Error exporting dashboard as ${exportFormat}:`, error);
        setExportStatus({
          success: false,
          message: t('export.error', { format: exportFormat, message: error.message, ns: 'common' })
        });
      })
      .finally(() => {
        setIsExporting(false);
      });
  };

  const handleClearData = () => {
    if (window.confirm(t('dataManagement.clearConfirmation'))) {
      // This would typically trigger actions to clear your stores
      // For now, just reload the page to reset the stored data
      window.localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-4 border-b">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-gray-500">{t('subtitle')}</p>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          {exportStatus && (
            <div className={`mb-6 p-4 ${exportStatus.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} border rounded-md`}>
              <p>
                {exportStatus.message}
              </p>
            </div>
          )}
          
          <div className="space-y-8">
            {/* Language Settings */}
            <div>
              <h2 className="text-xl font-semibold mb-4">{t('language.title')}</h2>
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="mb-4">
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('language.selectLanguage')}
                  </label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">{t('language.languages.en')}</option>
                    <option value="kk">{t('language.languages.kk')}</option>
                    <option value="ru">{t('language.languages.ru')}</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Dashboard Settings */}
            <div>
              <h2 className="text-xl font-semibold mb-4">{t('dashboardSettings')}</h2>
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="mb-4">
                  <label htmlFor="dashboard-name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('dashboardName')}
                  </label>
                  <input
                    type="text"
                    id="dashboard-name"
                    value={dashboardName}
                    onChange={(e) => setDashboardName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Export/Import */}
            <div>
              <h2 className="text-xl font-semibold mb-4">{t('export.title', { ns: 'common' })}</h2>
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-gray-600 mb-4">
                  {t('exportDescription')}
                </p>
                
                <div className="mb-4">
                  <label htmlFor="export-format" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('exportFormat')}
                  </label>
                  <select
                    id="export-format"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="json">{t('export.options.json', { ns: 'common' })}</option>
                    <option value="pdf">{t('export.options.pdf', { ns: 'common' })}</option>
                    <option value="image">{t('export.options.image', { ns: 'common' })}</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    {exportFormat === 'json' && t('exportJsonDescription')}
                    {exportFormat === 'pdf' && t('exportPdfDescription')}
                    {exportFormat === 'image' && t('exportImageDescription')}
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md transition-colors ${
                      isExporting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                  >
                    {isExporting ? t('export.exporting', { ns: 'common' }) : t('exportDashboard')}
                  </button>
                  
                  <label className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                    {t('importDashboard')}
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
              <h2 className="text-xl font-semibold mb-4 text-red-600">{t('dangerZone')}</h2>
              <div className="bg-white p-6 rounded-lg border border-red-200 shadow-sm">
                <h3 className="text-lg font-medium text-red-600 mb-2">{t('clearAllData')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('clearDataWarning')}
                </p>
                <button
                  onClick={handleClearData}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  {t('clearDashboardData')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 