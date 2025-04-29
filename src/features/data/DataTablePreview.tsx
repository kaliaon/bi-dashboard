import { useMemo } from 'react';
import { useDataStore } from '@/store/dataStore';

interface DataTablePreviewProps {
  dataSourceName?: string;
  dataSourceId?: string;
  maxRows?: number;
}

export default function DataTablePreview({
  dataSourceName,
  dataSourceId,
  maxRows = 10,
}: DataTablePreviewProps) {
  const { dataSources, activeDataSource } = useDataStore();

  // Get the data source to display
  const dataSource = useMemo(() => {
    if (dataSourceId) {
      return dataSources.find((ds) => ds.id === dataSourceId);
    }
    if (dataSourceName) {
      return dataSources.find((ds) => ds.name === dataSourceName);
    }
    if (activeDataSource) {
      return dataSources.find((ds) => ds.id === activeDataSource);
    }
    // If no specific data source is specified, show the most recent one
    return dataSources[dataSources.length - 1];
  }, [dataSources, dataSourceId, dataSourceName, activeDataSource]);

  if (!dataSource) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No data source available</p>
      </div>
    );
  }

  // Limit the number of rows to display
  const previewData = dataSource.data.slice(0, maxRows);

  return (
    <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-700">
          {dataSource.name} <span className="text-gray-500 text-sm">({dataSource.data.length} rows)</span>
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {dataSource.columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {previewData.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {dataSource.columns.map((column) => (
                  <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row[column]?.toString() || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {dataSource.data.length > maxRows && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-center text-sm text-gray-500">
          Showing {maxRows} of {dataSource.data.length} rows
        </div>
      )}
    </div>
  );
} 