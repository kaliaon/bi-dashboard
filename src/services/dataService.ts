import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { DataSource } from '@/store/dataStore';

// Configure PapaParse options
const parseConfig = {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  transformHeader: (header: string) => header.trim(),
};

// Parse CSV file and return as JSON
export const parseCSVFile = (file: File): Promise<{
  data: Record<string, any>[];
  columns: string[];
}> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      ...parseConfig,
      complete: (results) => {
        const data = results.data as Record<string, any>[];
        const columns = results.meta.fields || [];
        resolve({ data, columns });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

// Create a new data source from a parsed CSV
export const createDataSource = async (
  file: File,
  name?: string
): Promise<DataSource> => {
  try {
    const { data, columns } = await parseCSVFile(file);
    
    // Create a preview version with limited rows
    const preview = data.slice(0, 5);
    
    return {
      id: uuidv4(),
      name: name || file.name,
      data,
      columns,
      preview,
    };
  } catch (error) {
    console.error('Error creating data source:', error);
    throw error;
  }
};

// Filter data based on criteria
export const filterData = (
  data: Record<string, any>[],
  filters: Record<string, any>
): Record<string, any>[] => {
  return data.filter((row) => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return true;
      }
      
      // Check if it's a range filter
      if (typeof value === 'object' && ('min' in value || 'max' in value)) {
        const { min, max } = value;
        const rowValue = row[key];
        
        if (min !== undefined && max !== undefined) {
          return rowValue >= min && rowValue <= max;
        }
        if (min !== undefined) {
          return rowValue >= min;
        }
        if (max !== undefined) {
          return rowValue <= max;
        }
        return true;
      }
      
      // Check if it's an array for multi-select
      if (Array.isArray(value)) {
        return value.includes(row[key]);
      }
      
      // Basic equality check
      return row[key] === value;
    });
  });
}; 