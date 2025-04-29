import { useState, useEffect } from 'react'
import MainLayout from '@/layouts/MainLayout'
import DashboardPage from '@/pages/DashboardPage'
import ImportPage from '@/pages/ImportPage'
import SettingsPage from '@/pages/SettingsPage'

// Simple routing implementation
type Route = 'dashboard' | 'import' | 'settings'

function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard')

  const getPageTitle = () => {
    switch (currentRoute) {
      case 'dashboard':
        return 'Dashboard'
      case 'import':
        return 'Data Sources'
      case 'settings':
        return 'Settings'
      default:
        return 'Dashboard'
    }
  }

  // Update document title when route changes
  useEffect(() => {
    document.title = `${getPageTitle()} | Data Dashboard`;
  }, [currentRoute]);

  const renderPage = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardPage />
      case 'import':
        return <ImportPage />
      case 'settings':
        return <SettingsPage />
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
