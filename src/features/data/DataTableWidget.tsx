import { useMemo, useState } from 'react';
import { Widget } from '@/store/dashboardStore';
import { useDataStore } from '@/store/dataStore';
import { filterData } from '@/services/dataService';

interface DataTableWidgetProps {
  widget: Widget;
}

export default function DataTableWidget({ widget }: DataTableWidgetProps) {
  const { getDataSourceById } = useDataStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const { tableData, columns } = useMemo(() => {
    if (!widget.dataSource) {
      return { tableData: [], columns: [] };
    }
    
    const dataSource = getDataSourceById(widget.dataSource);
    if (!dataSource) {
      return { tableData: [], columns: [] };
    }
    
    // Apply any filters
    let filteredData = dataSource.data;
    if (widget.config.filters) {
      filteredData = filterData(dataSource.data, widget.config.filters);
    }
    
    // Select specific columns if configured
    const selectedColumns = widget.config.columns 
      ? dataSource.columns.filter(col => widget.config.columns?.includes(col))
      : dataSource.columns;
    
    return { 
      tableData: filteredData,
      columns: selectedColumns
    };
  }, [widget, getDataSourceById]);

  // Handle the case when there's no data
  if (tableData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-gray-500">
        <div className="text-center">
          <p className="mb-2">No data available</p>
          <p className="text-sm">
            {!widget.dataSource
              ? 'Please select a data source'
              : 'Check your data source and widget configuration'}
          </p>
        </div>
      </div>
    );
  }

  // Calculate pagination
  const start = page * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = tableData.slice(start, end);
  const totalPages = Math.ceil(tableData.length / rowsPerPage);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {columns.map((column) => (
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
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {columns.map((column) => (
                  <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row[column]?.toString() || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination controls */}
      <div className="border-t flex items-center justify-between px-4 py-3 bg-white">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              page === 0 ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              page >= totalPages - 1 ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{start + 1}</span> to{' '}
              <span className="font-medium">{Math.min(end, tableData.length)}</span> of{' '}
              <span className="font-medium">{tableData.length}</span> results
            </p>
          </div>
          <div>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0); // Reset to first page on rows per page change
              }}
              className="mr-4 inline-flex items-center px-2 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  page === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                &laquo;
              </button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                // Show pages around current page
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (page < 3) {
                  pageNum = i;
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === pageNum
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  page >= totalPages - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                &raquo;
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
} 