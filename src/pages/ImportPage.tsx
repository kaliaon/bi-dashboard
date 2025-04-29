import CSVImporter from '@/features/data/CSVImporter';
import { useDataStore } from '@/store/dataStore';

export default function ImportPage() {
  const { dataSources, removeDataSource } = useDataStore();

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-4 border-b">
        <h1 className="text-2xl font-bold">Data Sources</h1>
        <p className="text-gray-500">Import, manage, and preview your data sources</p>
      </div>
      
      <div className="flex-1 overflow-auto">
        {dataSources.length === 0 ? (
          <CSVImporter />
        ) : (
          <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Data Sources</h2>
              <button
                onClick={() => {}}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Import New Data
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
                      title="Delete data source"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="px-4 py-3">
                    <div className="mb-2">
                      <span className="text-sm text-gray-500">Columns: </span>
                      <span className="text-sm">{dataSource.columns.length}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-sm text-gray-500">Rows: </span>
                      <span className="text-sm">{dataSource.data.length}</span>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <button
                      onClick={() => {}}
                      className="text-blue-600 text-sm font-medium"
                    >
                      Preview Data
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 