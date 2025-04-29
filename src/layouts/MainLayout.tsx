import { useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Settings, 
  Menu, 
  PlusSquare, 
  User,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

// Define the Route type for navigation
type Route = 'dashboard' | 'import' | 'settings';

interface MainLayoutProps {
  children: ReactNode;
  currentRoute: Route;
  onRouteChange: Dispatch<SetStateAction<Route>>;
}

export default function MainLayout({ 
  children, 
  currentRoute, 
  onRouteChange 
}: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`bg-slate-900 text-white transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-56' : 'w-14'
        } flex-shrink-0 shadow-lg`}
      >
        <div className="h-16 flex items-center justify-between px-3 border-b border-slate-700">
          {/* {isSidebarOpen && (
            <h1 className="font-bold text-lg text-white">
              Dashboard
            </h1>
          )} */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-md hover:bg-slate-700 text-white"
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
        
        <nav className="py-3 h-full w-full flex flex-col gap-1.5 px-2">
          <button
            onClick={() => onRouteChange('dashboard')}
            className={`w-full p-2.5 rounded-md hover:bg-slate-800 flex items-center ${
              currentRoute === 'dashboard' ? 'bg-slate-800 text-white font-medium' : 'text-slate-300'
            } ${isSidebarOpen ? 'px-4 justify-start' : 'justify-center'}`}
            title="Dashboard"
          >
            <LayoutDashboard size={20} />
            {isSidebarOpen && (
              <span className="ml-3">Dashboard</span>
            )}
          </button>
      
          <button
            onClick={() => onRouteChange('import')}
            className={`w-full p-2.5 rounded-md hover:bg-slate-800 flex items-center ${
              currentRoute === 'import' ? 'bg-slate-800 text-white font-medium' : 'text-slate-300'
            } ${isSidebarOpen ? 'px-4 justify-start' : 'justify-center'}`}
            title="Data Sources"
          >
            <Database size={20} />
            {isSidebarOpen && (
              <span className="ml-3">Data Sources</span>
            )}
          </button>
      
          <button
            onClick={() => onRouteChange('settings')}
            className={`w-full p-2.5 rounded-md hover:bg-slate-800 flex items-center ${
              currentRoute === 'settings' ? 'bg-slate-800 text-white font-medium' : 'text-slate-300'
            } ${isSidebarOpen ? 'px-4 justify-start' : 'justify-center'}`}
            title="Settings"
          >
            <Settings size={20} />
            {isSidebarOpen && (
              <span className="ml-3">Settings</span>
            )}
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full h-full">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-700 md:hidden mr-2"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-medium text-slate-800 capitalize">{currentRoute}</h2>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              className="px-3.5 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-sm font-medium shadow-sm"
            >
              <PlusSquare size={16} />
              <span>Add Widget</span>
            </button>
            <button
              className="w-9 h-9 rounded-full hover:bg-slate-100 transition-colors text-slate-700 flex items-center justify-center"
              aria-label="User menu"
            >
              <User size={20} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto w-full p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 