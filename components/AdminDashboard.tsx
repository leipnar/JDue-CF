import React, { useState, useEffect } from 'react';
import { useDataContext } from '../context/DataContext';
import ActionMenu from './common/ActionMenu';
import Icon from './common/Icon';

interface User {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  totalProjects: number;
}

interface EditUsernameModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newUsername: string) => void;
}

const EditUsernameModal: React.FC<EditUsernameModalProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [newUsername, setNewUsername] = useState(user.username);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setNewUsername(user.username);
  }, [user.username]);

  const handleSave = async () => {
    if (!newUsername.trim() || newUsername === user.username) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await onSave(newUsername.trim());
      onClose();
    } catch (error) {
      console.error('Failed to update username:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Edit Username
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username
          </label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter new username"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !newUsername.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isLoading && <Icon name="loading" size={16} className="mr-2 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { user, callAPI } = useDataContext();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        callAPI('/admin/users', 'GET'),
        callAPI('/admin/stats', 'GET')
      ]);

      if (usersResponse.success) {
        setUsers(usersResponse.data || []);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data || null);
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (userId: number, action: string) => {
    try {
      let endpoint = '';
      let method = 'POST';
      
      switch (action) {
        case 'ban':
          endpoint = `/admin/users/${userId}/ban`;
          break;
        case 'unban':
          endpoint = `/admin/users/${userId}/unban`;
          break;
        case 'activate':
          endpoint = `/admin/users/${userId}/activate`;
          break;
        case 'deactivate':
          endpoint = `/admin/users/${userId}/deactivate`;
          break;
        case 'delete':
          endpoint = `/admin/users/${userId}`;
          method = 'DELETE';
          break;
        case 'edit':
          const userToEdit = users.find(u => u.id === userId);
          if (userToEdit) {
            setEditingUser(userToEdit);
          }
          return;
        default:
          console.error('Unknown action:', action);
          return;
      }

      const response = await callAPI(endpoint, method);
      
      if (response.success) {
        await loadAdminData(); // Reload data after successful action
      } else {
        console.error('Action failed:', response.error);
      }
    } catch (error) {
      console.error('Failed to perform user action:', error);
    }
  };

  const handleUsernameUpdate = async (newUsername: string) => {
    if (!editingUser) return;

    try {
      const response = await callAPI(`/admin/users/${editingUser.id}/username`, 'PUT', {
        username: newUsername
      });

      if (response.success) {
        await loadAdminData(); // Reload data to reflect changes
      } else {
        throw new Error(response.error || 'Failed to update username');
      }
    } catch (error) {
      console.error('Failed to update username:', error);
      throw error;
    }
  };

  const getUserActions = (user: User) => {
    const actions = [
      {
        label: 'Edit Username',
        action: 'edit',
        icon: 'edit' as const,
        className: 'text-blue-600 hover:text-blue-700'
      }
    ];

    if (user.isActive) {
      actions.push({
        label: 'Deactivate',
        action: 'deactivate',
        icon: 'eye-off' as const,
        className: 'text-orange-600 hover:text-orange-700'
      });
    } else {
      actions.push({
        label: 'Activate',
        action: 'activate',
        icon: 'eye' as const,
        className: 'text-green-600 hover:text-green-700'
      });
    }

    actions.push({
      label: user.isActive ? 'Ban User' : 'Unban User',
      action: user.isActive ? 'ban' : 'unban',
      icon: user.isActive ? 'lock' : 'unlock',
      className: user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
    });

    actions.push({
      label: 'Delete User',
      action: 'delete',
      icon: 'delete' as const,
      className: 'text-red-600 hover:text-red-700 border-t border-gray-200 dark:border-gray-600'
    });

    return actions;
  };

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Icon name="shield" size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon name="loading" size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Icon name="admin" size={28} className="mr-3 text-blue-600" />
          Admin Dashboard
        </h1>
        <button
          onClick={loadAdminData}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Icon name="refresh" size={16} className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Icon name="users" size={24} className="text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Icon name="user" size={24} className="text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Icon name="tasks" size={24} className="text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Icon name="projects" size={24} className="text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProjects}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            User Management
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isAdmin
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <ActionMenu
                        actions={getUserActions(user)}
                        onAction={(action) => handleUserAction(user.id, action)}
                        position="bottom-right"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Icon name="users" size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No users found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              There are no users in the system yet.
            </p>
          </div>
        )}
      </div>

      {/* Edit Username Modal */}
      {editingUser && (
        <EditUsernameModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleUsernameUpdate}
        />
      )}
    </div>
  );
};

export default AdminDashboard;