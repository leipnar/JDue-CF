import React, { useState, useEffect } from 'react';
import { DataProvider, useDataContext } from './context/DataContext';
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard';
import Icon from './components/common/Icon';
import './App.css';

// Project Management Component
const ProjectsView: React.FC = () => {
  const { projects, createProject, updateProject, deleteProject, callAPI } = useDataContext();
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
                    className="w-full text-lg font-semibold px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-