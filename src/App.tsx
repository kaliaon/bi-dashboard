import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/layouts/MainLayout'
import DashboardPage from '@/pages/DashboardPage'
import ImportPage from '@/pages/ImportPage'
import SettingsPage from '@/pages/SettingsPage'
import BIViewPage from '@/pages/BIViewPage'

// Simple routing implementation
type Route = 'dashboard' | 'import' | 'settings' | 'bi-view'

function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard')
  const { t } = useTranslation(['navigation', 'common'])

  const getPageTitle = () => {
    switch (currentRoute) {
      case 'dashboard':
        return t('dashboard')
      case 'import':
        return t('dataSources')
      case 'settings':
        return t('settings')
      case 'bi-view':
        return t('biView')
      default:
        return t('dashboard')
    }
  }

  // Update document title when route changes
  useEffect(() => {
    document.title = `${getPageTitle()} | ${t('app.title', { ns: 'common' })}`;
  }, [currentRoute, t]);

  const renderPage = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardPage />
      case 'import':
        return <ImportPage />
      case 'settings':
        return <SettingsPage />
      case 'bi-view':
        return <BIViewPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <MainLayout 
      currentRoute={currentRoute} 
      onRouteChange={setCurrentRoute}
    >
      {renderPage()}
    </MainLayout>
  )
}

export default App
