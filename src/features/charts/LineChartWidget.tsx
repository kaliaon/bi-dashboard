import { useMemo } from 'react';
import {
  LineChart,
  Line,
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
import { useTranslation } from 'react-i18next';

interface LineChartWidgetProps {
  widget: Widget;
}

export default function LineChartWidget({ widget }: LineChartWidgetProps) {
  const { t } = useTranslation('common');
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
    
    // Ensure we have valid X and Y axes configured
    if (!widget.config.x || !widget.config.y) {
      return [];
    }
    
    // Prepare data for LineChart
    return filteredData;
  }, [widget, getDataSourceById]);

  // Handle the case when there's no data
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-gray-500">
        <div className="text-center">
          <p className="mb-2">{t('charts.noDataAvailable')}</p>
          <p className="text-sm">
            {!widget.dataSource
              ? t('charts.selectDataSource')
              : t('charts.checkConfiguration')}
          </p>
        </div>
      </div>
    );
  }

  // Default to showing legend unless explicitly set to false
  const showLegend = widget.config.showLegend !== false;

  return (
    <div className="h-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={widget.config.x} 
            label={{ value: widget.config.xAxisLabel || widget.config.x, position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            label={{ 
              value: widget.config.yAxisLabel || widget.config.y, 
              angle: -90, 
              position: 'insideLeft' 
            }} 
          />
          <Tooltip />
          {showLegend && <Legend />}
          {Array.isArray(widget.config.values) && widget.config.values.length > 0 ? (
            // Multiple lines (one for each value in values array)
            widget.config.values.map((value, index) => (
              <Line
                key={value}
                type="monotone"
                dataKey={value}
                stroke={widget.config.colors?.[index] || `#${Math.floor(Math.random() * 16777215).toString(16)}`}
                activeDot={{ r: 8 }}
              />
            ))
          ) : (
            // Single line
            <Line
              type="monotone"
              dataKey={widget.config.y}
              stroke={widget.config.colors?.[0] || '#8884d8'}
              activeDot={{ r: 8 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 