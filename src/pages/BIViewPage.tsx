import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function BIViewPage() {
  const { t } = useTranslation(['biview', 'common']);
  const [powerBIUrl, setPowerBIUrl] = useState<string>('');
  const [displayUrl, setDisplayUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  const formatPowerBIUrl = (url: string): string | null => {
    // Basic URL validation
    if (!isValidUrl(url)) {
      return null;
    }
    
    try {
      const urlObj = new URL(url);
      
      // Check if it's a Power BI domain
      if (!urlObj.hostname.includes('powerbi.com')) {
        return null;
      }
      
      // If it's a direct link to Power BI but not an embed link, convert it
      if (urlObj.hostname.includes('powerbi.com') && !url.includes('reportEmbed')) {
        // Case 1: URL with groups pattern
        // Example: https://app.powerbi.com/groups/{groupId}/reports/{reportId}/...
        const groupReportMatch = url.match(/\/groups\/([a-zA-Z0-9-]+)\/reports\/([a-zA-Z0-9-]+)/);
        if (groupReportMatch && groupReportMatch[1] && groupReportMatch[2]) {
          const groupId = groupReportMatch[1];
          const reportId = groupReportMatch[2];
          return `https://app.powerbi.com/reportEmbed?reportId=${reportId}&groupId=${groupId}&autoAuth=true`;
        }
        
        // Case 2: URL with just reports pattern
        // Example: https://app.powerbi.com/reports/{reportId}/...
        const reportIdMatch = url.match(/\/reports\/([a-zA-Z0-9-]+)/);
        if (reportIdMatch && reportIdMatch[1]) {
          const reportId = reportIdMatch[1];
          return `https://app.powerbi.com/reportEmbed?reportId=${reportId}&autoAuth=true`;
        }
        
        // Case 3: View pattern
        // Example: https://app.powerbi.com/view?reportId={reportId}&...
        const viewParams = new URLSearchParams(urlObj.search);
        const viewReportId = viewParams.get('reportId');
        const viewGroupId = viewParams.get('groupId');
        
        if (viewReportId) {
          if (viewGroupId) {
            return `https://app.powerbi.com/reportEmbed?reportId=${viewReportId}&groupId=${viewGroupId}&autoAuth=true`;
          } else {
            return `https://app.powerbi.com/reportEmbed?reportId=${viewReportId}&autoAuth=true`;
          }
        }
      }
      
      // If already an embed URL, make sure it has the required parameters
      if (url.includes('reportEmbed')) {
        // Parse the URL and get existing parameters
        const params = new URLSearchParams(urlObj.search);
        
        // Create a new params object
        const newParams = new URLSearchParams();
        
        // Copy over existing parameters
        for (const [key, value] of params.entries()) {
          newParams.append(key, value);
        }
        
        // Ensure it has autoAuth=true
        if (!params.has('autoAuth')) {
          newParams.append('autoAuth', 'true');
        }
        
        // Rebuild the URL with all parameters
        return `${urlObj.origin}${urlObj.pathname}?${newParams.toString()}`;
      }
      
      // URL seems valid but we couldn't convert it to an embed URL
      return url;
      
    } catch (e) {
      console.error("Error formatting URL:", e);
      return null;
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    
    // Trim whitespace from URL
    const trimmedUrl = powerBIUrl.trim();
    
    if (!trimmedUrl) {
      setErrorMessage(t('pleaseEnterUrl'));
      setIsLoading(false);
      return;
    }
    
    // If not a valid URL format at all
    if (!isValidUrl(trimmedUrl)) {
      setErrorMessage(t('invalidUrlFormat'));
      setIsLoading(false);
      return;
    }
    
    // Format and validate the Power BI URL
    const formattedUrl = formatPowerBIUrl(trimmedUrl);
    
    if (!formattedUrl) {
      setErrorMessage(t('invalidPowerBIUrl'));
      setIsLoading(false);
      return;
    }
    
    // Valid URL, set it as the display URL
    setDisplayUrl(formattedUrl);
    
    // If we fixed the URL, update the input field with the corrected version
    if (formattedUrl !== trimmedUrl) {
      setPowerBIUrl(formattedUrl);
      console.log('URL converted to embed format:', formattedUrl);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">{t('title')}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {t('enterUrlDescription')}
        </p>
      </div>
      
      {/* URL Input Form */}
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={powerBIUrl}
              onChange={(e) => {
                setPowerBIUrl(e.target.value);
                // Clear error when user starts typing again
                if (errorMessage) setErrorMessage('');
              }}
              placeholder={t('urlPlaceholder')}
              className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errorMessage 
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-300' 
                  : 'border-blue-200 focus:ring-blue-300 focus:border-blue-300'
              }`}
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`px-5 py-2 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? t('app.loading', { ns: 'common' }) : t('loadDashboard')}
            </button>
          </div>
          
          {/* Error message */}
          {errorMessage && (
            <div className="text-red-500 text-sm mt-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {errorMessage}
            </div>
          )}
        </form>
      </div>
      
      {/* Dashboard iFrame */}
      {displayUrl ? (
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          <iframe 
            title="Power BI Dashboard" 
            src={displayUrl}
            width="100%" 
            height="100%" 
            allowFullScreen={true} 
            className="border-0"
          ></iframe>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-blue-50 rounded-xl border border-blue-100">
          <div className="text-center p-8 flex flex-col items-center">
            <div className="text-blue-400 mb-4 flex justify-center items-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-700 mb-2">{t('noDashboardLoaded')}</h2>
            <p className="text-gray-500 max-w-md">
              {t('noDashboardDescription')}
            </p>
          </div>
        </div>
      )}
      
      {/* Optional: Add additional controls or information below the iframe */}
      {displayUrl && (
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <div>
            {t('lastUpdated')}{' '}
            <span className="font-medium text-gray-700">
              {new Date().toLocaleString()}
            </span>
          </div>
          <div className="flex space-x-4">
            <button className="text-blue-600 hover:text-blue-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <polyline points="1 4 1 10 7 10"></polyline>
                <polyline points="23 20 23 14 17 14"></polyline>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
              </svg>
              {t('refreshDashboard')}
            </button>
            <button className="text-blue-600 hover:text-blue-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
              {t('downloadReport')}
            </button>
            <button className="text-blue-600 hover:text-blue-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M4 11a9 9 0 0 1 9 9"></path>
                <path d="M4 4a16 16 0 0 1 16 16"></path>
                <circle cx="5" cy="19" r="2"></circle>
              </svg>
              {t('shareView')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 