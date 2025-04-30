import { useMemo, useState, useEffect, useRef } from 'react';
import { Widget } from '@/store/dashboardStore';
import { useDataStore } from '@/store/dataStore';
import { filterData } from '@/services/dataService';
import { 
  ArrowDown, 
  ArrowUp, 
  ArrowUpDown,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoveLeft,
  MoveRight
} from 'lucide-react';

interface TableChartWidgetProps {
  widget: Widget;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

// Approximate row height in pixels (header + data row)
const ROW_HEIGHT = 36; // Adjust based on your actual row height

export default function TableChartWidget({ widget }: TableChartWidgetProps) {
  const { getDataSourceById } = useDataStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: null
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  
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

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.direction) {
      return tableData;
    }
    
    return [...tableData].sort((a, b) => {
      const valueA = a[sortState.column!];
      const valueB = b[sortState.column!];
      
      // Handle different data types
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortState.direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      // Convert to strings for string comparison
      const strA = String(valueA || '').toLowerCase();
      const strB = String(valueB || '').toLowerCase();
      
      if (sortState.direction === 'asc') {
        return strA.localeCompare(strB);
      } else {
        return strB.localeCompare(strA);
      }
    });
  }, [tableData, sortState]);

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
  }, []);

  // Handle sort toggling
  const handleSort = (column: string) => {
    setSortState(prev => {
      if (prev.column !== column) {
        return { column, direction: 'asc' };
      } else {
        // Toggle direction: null -> asc -> desc -> null
        if (prev.direction === null) return { column, direction: 'asc' };
        if (prev.direction === 'asc') return { column, direction: 'desc' };
        return { column: null, direction: null };
      }
    });
  };

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
  const paginatedData = sortedData.slice(start, end);
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  // Sort icon renderer
  const renderSortIcon = (column: string) => {
    if (sortState.column !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-gray-400" />;
    }
    
    return sortState.direction === 'asc' 
      ? <ArrowUp className="ml-1 h-3 w-3 text-blue-500" />
      : <ArrowDown className="ml-1 h-3 w-3 text-blue-500" />;
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      <div className="flex-1 overflow-auto min-h-0">
        <table className="min-w-full w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center">
                    <span className="truncate">{column}</span>
                    {renderSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody ref={tableBodyRef} className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {columns.map((column) => (
                  <td key={column} className="px-3 py-2 text-sm text-gray-500 truncate">
                    {row[column]?.toString() || '-'}
                  </td>
                ))}
              </tr>
            ))}
            {/* Add empty rows to fill space when fewer rows than rowsPerPage */}
            {paginatedData.length < rowsPerPage && Array.from({ length: rowsPerPage - paginatedData.length }).map((_, i) => (
              <tr key={`empty-${i}`} className={(paginatedData.length + i) % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {columns.map((column, colIndex) => (
                  <td key={`empty-${i}-${colIndex}`} className="px-3 py-2 text-sm text-gray-300">
                    &nbsp;
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination controls */}
      <div className="border-t flex items-center justify-between px-4 py-2 bg-white">
        <div className="flex-1 flex justify-left sm:hidden">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className={`relative inline-flex items-center justify-center p-1.5 rounded-full bg-transparent border-0 ${
              page === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-80'
            }`}
            aria-label="Previous page"
          >
            <ArrowLeft className='stroke-current stroke-[black]' size={16} />
          </button>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className={`relative inline-flex items-center justify-center p-1.5 rounded-full bg-transparent border-0 ${
              page >= totalPages - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-80'
            }`}
            aria-label="Next page"
          >
            <ArrowRight className='stroke-current stroke-[black]' size={16} />
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-left">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{sortedData.length > 0 ? start + 1 : 0}</span> to{' '}
              <span className="font-medium">{Math.min(end, sortedData.length)}</span> of{' '}
              <span className="font-medium">{sortedData.length}</span> results
            </p>
          </div>
          <div>
            <nav className="inline-flex items-center space-x-2" aria-label="Pagination">
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                className={`relative inline-flex items-center justify-center p-1.5 rounded-full bg-transparent border-0 ${
                  page === 0 ? 'opacity-30 cursor-not-allowed' : 'text-gray-800 hover:text-blue-600'
                }`}
                aria-label="First page"
                style={{ background: 'transparent' }}
              >
                <MoveLeft size={16} strokeWidth={2.5} />
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
                <ArrowLeft size={16} strokeWidth={2.5} />
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
                <ArrowRight size={16} strokeWidth={2.5} />
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
                <MoveRight size={16} strokeWidth={2.5} />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
} 