import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Map, LayoutDashboard, Camera, Menu, User, Recycle, Moon, Sun, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../contexts/AuthContext';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Mapa', path: '/map', icon: Map },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Descartar', path: '/disposal', icon: Camera },
  ];

  return (
    <div className="flex h-screen w-full bg-reflow-ice dark:bg-gray-900 overflow-hidden transition-colors">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm z-20 transition-colors">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-reflow-emerald font-bold text-2xl">
            <Recycle className="w-8 h-8" />
            ReFlow
          </div>
          <button onClick={toggleTheme} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium",
                  isActive 
                    ? "bg-reflow-emerald text-white shadow-md shadow-reflow-emerald/20" 
                    : "text-reflow-anthracite dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-reflow-anthracite dark:text-gray-200 truncate max-w-[100px]">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role === 'user' ? 'Cidadão' : user?.role === 'collector' ? 'Coletor' : 'Admin'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-20 shadow-sm transition-colors">
          <div className="flex items-center gap-2 text-reflow-emerald font-bold text-xl">
            <Recycle className="w-6 h-6" />
            ReFlow
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-reflow-anthracite dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-[65px] left-0 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg z-30 transition-colors">
            <nav className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium",
                      isActive 
                        ? "bg-reflow-emerald text-white" 
                        : "text-reflow-anthracite dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-left w-full"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            </nav>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-auto relative">
          <Outlet />
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden flex items-center justify-around bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 p-3 min-w-[72px] transition-colors",
                  isActive ? "text-reflow-emerald" : "text-gray-400 dark:text-gray-500 hover:text-reflow-anthracite dark:hover:text-gray-300"
                )
              }
            >
              <item.icon className={cn("w-6 h-6", item.path === '/disposal' && "w-7 h-7")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
}
