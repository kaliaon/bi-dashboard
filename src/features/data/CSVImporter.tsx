import { useState, useRef, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useCSVParser } from '@/hooks/useCSVParser';
import DataTablePreview from './DataTablePreview';

export default function CSVImporter() {
  const { t } = useTranslation(['import', 'common']);
  const [file, setFile] = useState<File | null>(null);
  const [dataSourceName, setDataSourceName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isLoading, error, parseCSV } = useCSVParser();
  const [isImported, setIsImported] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      
      // Set default name from file name (without extension)
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
      setDataSourceName(fileName);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      
      // Set default name from file name (without extension)
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
      setDataSourceName(fileName);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    try {
      await parseCSV(file, dataSourceName);
      setIsImported(true);
    } catch (err) {
      console.error('Error importing CSV:', err);
    }
  };

  const handleReset = () => {
    setFile(null);
    setDataSourceName('');
    setIsImported(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isImported) {
    return (
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t('importSuccess', 'Import Successful')}</h2>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('importAnother', 'Import Another File')}
          </button>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <p className="text-green-800">
            <span className="font-medium">{t('app.success', { ns: 'common' })}!</span> {t('successMessage', 'Your CSV data has been imported and is now available for use in your dashboard.')}
          </p>
        </div>
        <DataTablePreview dataSourceName={dataSourceName} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">{t('importCSV', 'Import CSV Data')}</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">
            <span className="font-medium">{t('app.error', { ns: 'common' })}:</span> {error.message}
          </p>
        </div>
      )}
      
      <div
        className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer ${
          isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-lg text-gray-600 mb-2">
          {file ? file.name : t('dataSourceSettings.dragAndDrop')}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {file ? `${(file.size / 1024).toFixed(2)} KB` : t('clickToBrowse', 'or click to browse files')}
        </p>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv"
          onChange={handleFileChange}
        />
      </div>
      
      {file && (
        <div className="mt-6">
          <div className="mb-4">
            <label htmlFor="dataSourceName" className="block text-sm font-medium text-gray-700">
              {t('dataSourceSettings.dataSourceName')}
            </label>
            <input
              type="text"
              id="dataSourceName"
              value={dataSourceName}
              onChange={(e) => setDataSourceName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder={t('dataSourceSettings.dataSourceNamePlaceholder')}
            />
          </div>
          
          <button
            onClick={handleImport}
            disabled={isLoading || !dataSourceName}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading || !dataSourceName
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isLoading ? t('app.loading', 'Importing...', { ns: 'common' }) : t('import')}
          </button>
        </div>
      )}
    </div>
  );
} 