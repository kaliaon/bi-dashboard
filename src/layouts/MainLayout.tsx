import { useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Database, 
  Settings, 
  ChevronRight,
  ChevronLeft,
  BarChart3
} from 'lucide-react';

// Define the Route type for navigation
type Route = 'dashboard' | 'import' | 'settings' | 'bi-view';

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
  const { t } = useTranslation('navigation');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-blue-50 to-slate-50">
      {/* Sidebar */}
      <aside
        className={`bg-white transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } flex-shrink-0 shadow-sm border-r border-blue-100/50 relative z-10`}
      >
        <div className="h-16 flex items-center justify-between px-5">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-blue-200 ${isSidebarOpen ? 'ml-auto' : 'mx-auto'} animate-pulse-once`}
            aria-label={isSidebarOpen ? t('collapseSidebar') : t('expandSidebar')}
          >
            {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
        
        <div className="px-4 my-2">
          <div className={`h-px w-full bg-gradient-to-r from-transparent via-blue-100 to-transparent opacity-60`}></div>
        </div>
        
        <nav className="py-3 h-full w-full flex flex-col gap-2 px-4">
          <NavButton 
            isActive={currentRoute === 'dashboard'} 
            isSidebarOpen={isSidebarOpen}
            onClick={() => onRouteChange('dashboard')}
            title={t('dashboard')}
            icon={<LayoutDashboard size={18} />}
          />
      
          <NavButton 
            isActive={currentRoute === 'import'} 
            isSidebarOpen={isSidebarOpen}
            onClick={() => onRouteChange('import')}
            title={t('dataSources')}
            icon={<Database size={18} />}
          />
          
          <NavButton 
            isActive={currentRoute === 'bi-view'} 
            isSidebarOpen={isSidebarOpen}
            onClick={() => onRouteChange('bi-view')}
            title={t('biView')}
            icon={<BarChart3 size={18} />}
          />
      
          <NavButton 
            isActive={currentRoute === 'settings'} 
            isSidebarOpen={isSidebarOpen}
            onClick={() => onRouteChange('settings')}
            title={t('settings')}
            icon={<Settings size={18} />}
          />
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full h-full">
        {/* Content */}
        <main className="flex-1 overflow-auto w-full p-8 bg-white m-4 rounded-2xl shadow-sm">
          {children}
        </main>
      </div>
    </div>
  );
} 

// Extract NavButton as a reusable component
interface NavButtonProps {
  isActive: boolean;
  isSidebarOpen: boolean;
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
}

const NavButton = ({ isActive, isSidebarOpen, onClick, title, icon }: NavButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full py-3 rounded-xl flex items-center 
        transition-all duration-200 ease-in-out
        ${isSidebarOpen ? 'px-4 justify-start' : 'px-0 justify-center'} 
        ${isActive 
          ? 'bg-blue-50 text-blue-700 font-medium' 
          : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50/50'
        }
        focus:outline-none focus:ring-1 focus:ring-blue-200
        ${isActive ? 'animate-fade-in' : ''}
      `}
      title={title}
    >
      <div className={`
        ${isActive 
          ? 'bg-blue-500 text-white p-2.5 rounded-lg shadow-sm' 
          : 'text-slate-400 p-2.5 group-hover:text-blue-500 group-hover:bg-white group-hover:shadow-sm group-hover:rounded-lg'
        } 
        transition-all duration-200
      `}>
        {icon}
      </div>
      
      {isSidebarOpen && (
        <span className={`
          ml-3 text-sm font-medium
          ${isActive ? 'text-blue-700' : 'text-slate-500 group-hover:text-blue-600'}
          transition-colors duration-200
        `}>
          {title}
        </span>
      )}
      
      {isActive && isSidebarOpen && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
      )}
    </button>
  );
};