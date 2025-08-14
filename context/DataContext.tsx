import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import apiFetch from '../services/api';
import type { User, Project, Task } from '../types';

interface DataContextType {
    currentUser: User | null;
    projects: Project[];
    tasks: Task[];
    users: User[];
    loading: boolean;
    error: string | null;
    // Simplified methods for testing
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (email: string, password: string) => {
        try {
            console.log('DataContext: Starting login...');
            setLoading(true);
            setError(null);
            
            const loginData = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            
            console.log('DataContext: Login response:', loginData);
            
            if (loginData.token) {
                localStorage.setItem('todo_auth_token', loginData.token);
                setCurrentUser(loginData.user);
                
                console.log('DataContext: Getting user data...');
                
                // Get user data
                const userData = await apiFetch('/users/me');
                console.log('DataContext: User data:', userData);
                
                const appData = await apiFetch('/data');
                console.log('DataContext: App data:', appData);
                
                setProjects(appData.projects || []);
                setTasks(appData.tasks || []);
                
                console.log('DataContext: Login complete');
            }
        } catch (error) {
            console.error('DataContext: Login error:', error);
            setError(error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        console.log('DataContext: Logging out...');
        localStorage.removeItem('todo_auth_token');
        setCurrentUser(null);
        setProjects([]);
        setTasks([]);
        setUsers([]);
        setError(null);
    }, []);

    const value = {
        currentUser,
        projects,
        tasks,
        users,
        loading,
        error,
        login,
        logout,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
