import { Widget } from '@/store/dashboardStore';
import { DataSource } from '@/store/dataStore';

export interface DashboardExport {
  name: string;
  widgets: Widget[];
  dataSources: DataSource[];
  version: string;
  createdAt: string;
}

// Save dashboard configuration to a file
export const exportDashboard = (
  name: string, 
  widgets: Widget[], 
  dataSources: DataSource[]
): void => {
  const dashboardExport: DashboardExport = {
    name,
    widgets,
    dataSources,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
  };

  const dataStr = JSON.stringify(dashboardExport, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const exportFileDefaultName = `${name.toLowerCase().replace(/\s+/g, '-')}-dashboard.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

// Load dashboard configuration from a file
export const importDashboard = (file: File): Promise<DashboardExport> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        
        // Validate the imported data
        if (!jsonData.widgets || !jsonData.dataSources || !jsonData.version) {
          throw new Error('Invalid dashboard file format');
        }
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}; 