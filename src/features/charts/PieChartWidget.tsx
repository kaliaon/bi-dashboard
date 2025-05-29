import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Widget } from '@/store/dashboardStore';
import { useDataStore } from '@/store/dataStore';
import { filterData } from '@/services/dataService';
import { useTranslation } from 'react-i18next';

interface PieChartWidgetProps {
  widget: Widget;
}

// Default colors for the pie slices
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function PieChartWidget({ widget }: PieChartWidgetProps) {
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
    
    // Ensure we have valid category and value configured
    if (!widget.config.category || !widget.config.value) {
      return [];
    }
    
    // For pie charts, we often need to aggregate data
    // If the data is already aggregated, we can use it directly
    if (widget.config.aggregated) {
      return filteredData.map(item => ({
        name: item[widget.config.category!],
        value: item[widget.config.value!]
      }));
    }
    
    // Otherwise, we need to aggregate it ourselves
    // This is a simple groupBy with sum aggregation
    const aggregatedData = filteredData.reduce((acc, item) => {
      const key = item[widget.config.category!];
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += parseFloat(item[widget.config.value!]) || 0;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array format for Recharts
    return Object.entries(aggregatedData).map(([name, value]) => ({
      name,
      value
    }));
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
  // Use configured colors or default colors
  const colors = widget.config.colors || COLORS;

  return (
    <div className="h-full p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={"value" as string}
          >
            {chartData.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value}`, widget.config.valueLabel || t('charts.value')]} 
          />
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 