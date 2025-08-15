import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
}

interface Project {
  id: number;
  name: string;
  description?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  projectId?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface DataContextType {
  user: User | null;
  isLoading: boolean;
  currentView: string;
  setCurrentView: (view: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  projects: Project[];
  tasks: Task[];
  callAPI: (endpoint: string, method?: string, body?: any) => Promise<any>;
  createProject: (projectData: Partial<Project>) => Promise<void>;
  updateProject: (projectId: number, projectData: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: number) => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<void>;
  updateTask: (taskId: number, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const API_BASE_URL = 'https://jdue-api.ditrust.workers.dev/api';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await callAPI('/users/me', 'GET');
      if (response.success && response.data) {
        setUser(response.data);
        await loadUserData();
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const response = await callAPI('/data', 'GET');
      if (response.success && response.data) {
        setProjects(response.data.projects || []);
        setTasks(response.data.tasks || []);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const callAPI = async (endpoint: string, method: string = 'GET', body?: any) => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const config: RequestInit = {
        method,
        headers,
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        setUser(null);
        throw new Error('Session expired or invalid, logging out.');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await callAPI('/auth/login', 'POST', { email, password });
      
      if (response.success && response.data) {
        localStorage.setItem('auth_token', response.data.token);
        setUser(response.data.user);
        await loadUserData();
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      const response = await callAPI('/auth/register', 'POST', { email, password, username });
      
      if (response.success && response.data) {
        localStorage.setItem('auth_token', response.data.token);
        setUser(response.data.user);
        await loadUserData();
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setProjects([]);
    setTasks([]);
    setCurrentView('dashboard');
  };

  const createProject = async (projectData: Partial<Project>) => {
    try {
      const response = await callAPI('/projects', 'POST', projectData);
      if (response.success && response.data) {
        setProjects(prev => [response.data, ...prev]);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  };

  const updateProject = async (projectId: number, projectData: Partial<Project>) => {
    try {
      const response = await callAPI(`/projects/${projectId}`, 'PUT', projectData);
      if (response.success && response.data) {
        setProjects(prev => prev.map(p => p.id === projectId ? response.data : p));
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  };

  const deleteProject = async (projectId: number) => {
    try {
      const response = await callAPI(`/projects/${projectId}`, 'DELETE');
      if (response.success) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setTasks(prev => prev.filter(t => t.projectId !== projectId));
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  };

  const createTask = async (taskData: Partial<Task>) => {
    try {
      const response = await callAPI('/tasks', 'POST', taskData);
      if (response.success && response.data) {
        setTasks(prev => [response.data, ...prev]);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const updateTask = async (taskId: number, taskData: Partial<Task>) => {
    try {
      const response = await callAPI(`/tasks/${taskId}`, 'PUT', taskData);
      if (response.success && response.data) {
        setTasks(prev => prev.map(t => t.id === taskId ? response.data : t));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const response = await callAPI(`/tasks/${taskId}`, 'DELETE');
      if (response.success) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const value: DataContextType = {
    user,
    isLoading,
    currentView,
    setCurrentView,
    login,
    register,
    logout,
    projects,
    tasks,
    callAPI,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

export default DataContext;
