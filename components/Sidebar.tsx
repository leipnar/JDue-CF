import React from 'react';
import { useDataContext } from '../context/DataContext';
import Icon from './common/Icon';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout, currentView, setCurrentView } = useDataContext();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' as const },
    { id: 'tasks', label: 'Tasks', icon: 'tasks' as const },
    { id: 'projects', label: 'Projects', icon: 'projects' as const },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' as const },
  ];

  if (user?.isAdmin) {
    navigationItems.push({
      id: 'admin',
      label: 'Admin Panel',
      icon: 'admin' as const
    });
  }

  const handleNavigation = (viewId: string) => {
    setCurrentView(viewId);
    // On mobile, close sidebar after navigation
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 
        bg-white dark:bg-gray-800 
        border-r border-gray-200 dark:border-gray-700 
        transform transition-transform duration-300 ease-in-out z-30
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Icon name="tasks" size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              JDue
            </h1>
          </div>
          
          {/* Close button - mobile only */}
          <button
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
            aria-label="Close sidebar"
          >
            <Icon name="close" size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors
                    ${currentView === item.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon 
                    name={item.icon} 
                    size={20} 
                    className={currentView === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}
                  />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <Icon name="user" size={16} className="text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.username || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => handleNavigation('profile')}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <Icon name="settings" size={16} className="text-gray-500 dark:text-gray-400" />
              <span className="text-sm">Settings</span>
            </button>
            
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <Icon name="logout" size={16} className="text-gray-500 dark:text-gray-400" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;