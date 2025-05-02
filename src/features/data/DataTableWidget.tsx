import { useMemo, useState, useEffect, useRef } from 'react';
import { Widget } from '@/store/dashboardStore';
import { useDataStore } from '@/store/dataStore';
import { filterData } from '@/services/dataService';

interface DataTableWidgetProps {
  widget: Widget;
}

// Approximate row height in pixels (header + data row)
const ROW_HEIGHT = 42; // Adjust based on your actual row height

export default function DataTableWidget({ widget }: DataTableWidgetProps) {
  const { getDataSourceById } = useDataStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const containerRef = useRef<HTMLDivElement>(null);
  
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

  // Calculate visible rows based on container height
  useEffect(() => {
    const updateVisibleRows = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        // Subtract header height and pagination control height
        const availableHeight = containerHeight - 40 - 48; // header ~40px, pagination ~48px
        const calculatedRows = Math.max(1, Math.floor(availableHeight / ROW_HEIGHT));
        
        // Only update if changed significantly to avoid constant updates
        if (Math.abs(calculatedRows - rowsPerPage) > 1) {
          setRowsPerPage(calculatedRows);
          setPage(0); // Reset to first page when changing rows per page
        }
      }
    };

    // Initial calculation
    updateVisibleRows();

    // Set up ResizeObserver to recalculate on container resize
    const resizeObserver = new ResizeObserver(updateVisibleRows);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [rowsPerPage]);

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
    <div ref={containerRef} className="h-full flex flex-col">
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
            {/* Add empty rows to fill space when fewer rows than rowsPerPage */}
            {paginatedData.length < rowsPerPage && Array.from({ length: rowsPerPage - paginatedData.length }).map((_, i) => (
              <tr key={`empty-${i}`} className={(paginatedData.length + i) % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {columns.map((column, colIndex) => (
                  <td key={`empty-${i}-${colIndex}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    &nbsp;
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination controls */}
      <div className="border-t flex items-center justify-center px-4 py-2 bg-white sticky bottom-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage(0)}
            disabled={page === 0}
            className={`relative inline-flex items-center justify-center p-1.5 rounded-full bg-transparent border-0 ${
              page === 0 ? 'opacity-30 cursor-not-allowed' : 'text-gray-800 hover:text-blue-600'
            }`}
            aria-label="First page"
            style={{ background: 'transparent' }}
          >
            &laquo;&laquo;
          </button>
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className={`relative inline-flex items-center justify-center p-1.5 rounded-full bg-transparent border-0 ${
              page === 0 ? 'opacity-30 cursor-not-allowed' : 'text-gray-800 hover:text-blue-600'
            }`}
            aria-label="Previous page"
            style={{ background: 'transparent' }}
          >
            &laquo;
          </button>
          
          <div className="px-2 text-sm font-medium text-gray-700">
            {page + 1} / {totalPages}
          </div>
          
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className={`relative inline-flex items-center justify-center p-1.5 rounded-full bg-transparent border-0 ${
              page >= totalPages - 1 ? 'opacity-30 cursor-not-allowed' : 'text-gray-800 hover:text-blue-600'
            }`}
            aria-label="Next page"
            style={{ background: 'transparent' }}
          >
            &raquo;
          </button>
          <button
            onClick={() => setPage(totalPages - 1)}
            disabled={page >= totalPages - 1}
            className={`relative inline-flex items-center justify-center p-1.5 rounded-full bg-transparent border-0 ${
              page >= totalPages - 1 ? 'opacity-30 cursor-not-allowed' : 'text-gray-800 hover:text-blue-600'
            }`}
            aria-label="Last page"
            style={{ background: 'transparent' }}
          >
            &raquo;&raquo;
          </button>
        </div>
      </div>
    </div>
  );
} 