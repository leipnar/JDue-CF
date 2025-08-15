import React, { useState, useEffect } from 'react';
import { DataProvider, useDataContext } from './context/DataContext';
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard';
import Icon from './components/common/Icon';

// Project Management Component
const ProjectsView: React.FC = () => {
  const { projects, createProject, updateProject, deleteProject } = useDataContext();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      await createProject({
        name: newProjectName.trim(),
        description: newProjectDescription.trim() || undefined
      });
      setNewProjectName('');
      setNewProjectDescription('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editingProject.name.trim()) return;

    try {
      await updateProject(editingProject.id, {
        name: editingProject.name.trim(),
        description: editingProject.description?.trim() || undefined
      });
      setEditingProject(null);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      return;
    }

    try {
      await deleteProject(projectId);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Icon name="projects" size={28} className="mr-3 text-blue-600" />
          Projects
        </h1>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Icon name="plus" size={16} className="mr-2" />
          New Project
        </button>
      </div>

      {/* Create Project Form */}
      {isCreating && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Create New Project
          </h3>
          <form onSubmit={handleCreateProject}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter project name"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter project description"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewProjectName('');
                  setNewProjectDescription('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newProjectName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="grid gap-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            {editingProject?.id === project.id ? (
              <form onSubmit={handleEditProject}>
                <div className="mb-4">
                  <input
                    type="text"
                    value={editingProject.name}
                    onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                    className="w-full text-lg font-semibold px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <textarea
                    value={editingProject.description || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Project description"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                      {project.updatedAt !== project.createdAt && (
                        <span>Updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingProject(project)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md"
                      title="Edit project"
                    >
                      <Icon name="edit" size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-md"
                      title="Delete project"
                    >
                      <Icon name="delete" size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {projects.length === 0 && !isCreating && (
        <div className="text-center py-12">
          <Icon name="projects" size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No projects yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Get started by creating your first project.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Icon name="plus" size={16} className="mr-2" />
            Create Project
          </button>
        </div>
      )}
    </div>
  );
};

// Theme Toggle Hook
const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return { isDark, toggleTheme: () => setIsDark(!isDark) };
};

// Main App Content Component
const AppContent: React.FC = () => {
  const { user, currentView, isLoading } = useDataContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'admin':
        return <AdminDashboard />;
      case 'projects':
        return <ProjectsView />;
      case 'tasks':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Icon name="tasks" size={28} className="mr-3 text-blue-600" />
              Tasks
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Tasks view coming soon...</p>
          </div>
        );
      case 'calendar':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Icon name="calendar" size={28} className="mr-3 text-blue-600" />
              Calendar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Calendar view coming soon...</p>
          </div>
        );
      case 'profile':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Icon name="settings" size={28} className="mr-3 text-blue-600" />
              Settings
            </h1>
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Theme</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose between light and dark mode
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`
                    relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${isDark ? 'bg-blue-600' : 'bg-gray-200'}
                  `}
                >
                  <span
                    className={`
                      inline-block w-4 h-4 transform bg-white rounded-full transition-transform
                      ${isDark ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                  <span className="sr-only">Toggle theme</span>
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Icon name="home" size={28} className="mr-3 text-blue-600" />
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Welcome to JDue, {user?.username}!
            </p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Icon name="loading" size={32} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu Button */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
                aria-label="Toggle sidebar"
              >
                <Icon name="menu" size={20} className="text-gray-600 dark:text-gray-400" />
              </button>

              {/* Desktop hamburger for collapsing sidebar */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hidden md:block"
                aria-label="Toggle sidebar"
              >
                <Icon name="menu" size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
              >
                <Icon 
                  name={isDark ? 'sun' : 'moon'} 
                  size={20} 
                  className="text-gray-600 dark:text-gray-400" 
                />
              </button>

              {/* User Avatar */}
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <Icon name="user" size={16} className="text-gray-600 dark:text-gray-300" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

// Login Component
const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const { login, register } = useDataContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegister) {
        await register(email, password, username);
      } else {
        await login(email, password);
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Icon name="tasks" size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">JDue</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isRegister ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading && <Icon name="loading" size={16} className="mr-2 animate-spin" />}
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            disabled={isLoading}
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </form>

        {/* Test Credentials */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Test Credentials:</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Email: test@example.com<br />
            Password: SecurePassword123!
          </p>
        </div>
      </div>
    </div>
  );
};

// Root component that handles authentication state
const AuthenticatedApp: React.FC = () => {
  const { user, isLoading } = useDataContext();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Icon name="loading" size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <AppContent />;
};

// Main App Component
const App: React.FC = () => {
  return (
    <DataProvider>
      <AuthenticatedApp />
    </DataProvider>
  );
};

export default App;