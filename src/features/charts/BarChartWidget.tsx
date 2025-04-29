import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Widget } from '@/store/dashboardStore';
import { useDataStore } from '@/store/dataStore';
import { filterData } from '@/services/dataService';

interface BarChartWidgetProps {
  widget: Widget;
}

export default function BarChartWidget({ widget }: BarChartWidgetProps) {
  const { getDataSourceById } = useDataStore();
  
  const chartData = useMemo(() => {
    if (!widget.dataSource) {
      return [];
    }
    
    const dataSource = getDataSourceById(widget.dataSource);
    if (!dataSource) {
      return [];
    }
    
    // Apply any filters
    let filteredData = dataSource.data;
    if (widget.config.filters) {
      filteredData = filterData(dataSource.data, widget.config.filters);
    }
    
    // Ensure we have valid category axis and values configured
    if (!widget.config.category) {
      return [];
    }
    
    // Prepare data for BarChart
    return filteredData;
  }, [widget, getDataSourceById]);

  // Handle the case when there's no data
  if (chartData.length === 0) {
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

  return (
    <div className="h-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={widget.config.category} 
            label={{ 
              value: widget.config.xAxisLabel || widget.config.category, 
              position: 'insideBottom', 
              offset: -5 
            }}
          />
          <YAxis 
            label={{ 
              value: widget.config.yAxisLabel || '', 
              angle: -90, 
              position: 'insideLeft' 
            }} 
          />
          <Tooltip />
          <Legend />
          {Array.isArray(widget.config.values) ? (
            // Multiple bars (one for each value in values array)
            widget.config.values.map((value, index) => (
              <Bar
                key={value}
                dataKey={value}
                fill={widget.config.colors?.[index] || `#${Math.floor(Math.random() * 16777215).toString(16)}`}
              />
            ))
          ) : (
            // Single bar (if only a single value is provided)
            <Bar
              dataKey={widget.config.values || widget.config.y}
              fill={widget.config.colors?.[0] || '#8884d8'}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 