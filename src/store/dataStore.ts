import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DataSource {
  id: string;
  name: string;
  data: Record<string, any>[];
  columns: string[];
  preview?: Record<string, any>[];
}

interface DataState {
  dataSources: DataSource[];
  activeDataSource: string | null;
  addDataSource: (dataSource: DataSource) => void;
  updateDataSource: (id: string, dataSource: Partial<DataSource>) => void;
  removeDataSource: (id: string) => void;
  setActiveDataSource: (id: string | null) => void;
  getDataSourceById: (id: string) => DataSource | undefined;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      dataSources: [],
      activeDataSource: null,
      addDataSource: (dataSource) => set((state) => ({ 
        dataSources: [...state.dataSources, dataSource] 
      })),
      updateDataSource: (id, updatedDataSource) => set((state) => ({
        dataSources: state.dataSources.map((dataSource) => 
          dataSource.id === id ? { ...dataSource, ...updatedDataSource } : dataSource
        )
      })),
      removeDataSource: (id) => set((state) => ({ 
        dataSources: state.dataSources.filter((dataSource) => dataSource.id !== id) 
      })),
      setActiveDataSource: (id) => set({ activeDataSource: id }),
      getDataSourceById: (id) => get().dataSources.find(ds => ds.id === id),
    }),
    {
      name: 'data-sources-storage',
    }
  )
); 