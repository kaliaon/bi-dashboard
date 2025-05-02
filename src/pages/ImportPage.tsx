import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CSVImporter from '@/features/data/CSVImporter';
import DataTablePreview from '@/features/data/DataTablePreview';
import { useDataStore } from '@/store/dataStore';

// Modal component for data preview
const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  const { t } = useTranslation('import');
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{t('dataPreview', 'Data Preview')}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function ImportPage() {
  const { dataSources, removeDataSource } = useDataStore();
  const { t } = useTranslation(['import', 'common']);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedDataSourceId, setSelectedDataSourceId] = useState<string | null>(null);

  const handlePreviewClick = (dataSourceId: string) => {
    setSelectedDataSourceId(dataSourceId);
    setPreviewModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-4 border-b">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-gray-500">{t('subtitle', 'Import, manage, and preview your data sources')}</p>
      </div>
      
      <div className="flex-1 overflow-auto">
        {dataSources.length === 0 ? (
          <CSVImporter />
        ) : (
          <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold">{t('yourDataSources', 'Your Data Sources')}</h2>
              <button
                onClick={() => {}}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {t('addDataSource')}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dataSources.map((dataSource) => (
                <div
                  key={dataSource.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-medium">{dataSource.name}</h3>
                    <button
                      onClick={() => removeDataSource(dataSource.id)}
                      className="text-red-600 hover:text-red-800"
                      title={t('dataSourceActions.delete')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="px-4 py-3">
                    <div className="mb-2">
                      <span className="text-sm text-gray-500">{t('columns')}: </span>
                      <span className="text-sm">{dataSource.columns.length}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm text-gray-500">{t('rows')}: </span>
                      <span className="text-sm">{dataSource.data.length}</span>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <button
                      onClick={() => handlePreviewClick(dataSource.id)}
                      className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        className="mr-1"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {t('dataSourceActions.view')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Data Preview Modal */}
      <Modal isOpen={previewModalOpen} onClose={() => setPreviewModalOpen(false)}>
        {selectedDataSourceId && (
          <DataTablePreview 
            dataSourceId={selectedDataSourceId} 
            maxRows={20}
          />
        )}
      </Modal>
    </div>
  );
} 