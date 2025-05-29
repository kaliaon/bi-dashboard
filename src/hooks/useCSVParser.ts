import { useState } from 'react';
import { createDataSource } from '@/services/dataService';
import { useDataStore, DataSource } from '@/store/dataStore';

interface CSVParserState {
  isLoading: boolean;
  error: Error | null;
}

export function useCSVParser() {
  const [state, setState] = useState<CSVParserState>({
    isLoading: false,
    error: null,
  });
  
  const { addDataSource, setActiveDataSource } = useDataStore();

  const parseCSV = async (file: File, name?: string): Promise<DataSource | null> => {
    setState({ isLoading: true, error: null });
    
    try {
      // Use the dataService to parse the CSV
      const dataSource = await createDataSource(file, name);
      
      // Add the data source to the store
      addDataSource(dataSource);
      
      // Set as active data source
      setActiveDataSource(dataSource.id);
      
      setState({ isLoading: false, error: null });
      return dataSource;
    } catch (error) {
      setState({ 
        isLoading: false, 
        error: error instanceof Error ? error : new Error('Failed to parse CSV file') 
      });
      return null;
    }
  };

  return {
    ...state,
    parseCSV,
  };
} 