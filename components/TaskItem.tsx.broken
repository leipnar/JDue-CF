import React from 'react';
import type { Task } from '../types';
import Icon from './common/Icon';

interface TaskItemProps {
  task: Task;
  onToggle?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onEdit, onDelete }) => {
  // Normalize priority to lowercase for consistent mapping
  const normalizedPriority = (task.priority || 'medium').toLowerCase();
  
  // Priority classes mapping with fallback
  const priorityClasses = {
    low: {
      dot: 'bg-green-500',
      border: 'border-green-200',
      text: 'text-green-700'
    },
    medium: {
      dot: 'bg-yellow-500', 
      border: 'border-yellow-200',
      text: 'text-yellow-700'
    },
    high: {
      dot: 'bg-red-500',
      border: 'border-red-200', 
      text: 'text-red-700'
    },
    urgent: {
      dot: 'bg-purple-500',
      border: 'border-purple-200',
      text: 'text-purple-700'
    }
  };

  // Get priority classes with fallback to medium
  const currentPriorityClasses = priorityClasses[normalizedPriority as keyof typeof priorityClasses] || priorityClasses.medium;

  return (
    <div className={`p-4 bg-white dark:bg-slate-800 rounded-lg border ${currentPriorityClasses.border} hover:shadow-sm transition-shadow`}>
      <div className="flex items-start gap-3">
        {/* Priority dot */}
        <span className={`flex-shrink-0 mt-1.5 w-3 h-3 rounded-full ${currentPriorityClasses.dot}`}></span>
        
        {/* Task content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggle?.(task)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                task.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              {task.completed && <Icon name="check" className="w-3 h-3" />}
            </button>
            
            <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
              {task.title}
            </h3>
            
            <span className={`text-xs px-2 py-1 rounded-full ${currentPriorityClasses.text} bg-opacity-20`}>
              {task.priority}
            </span>
          </div>
          
          {task.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
          )}
          
          {task.dueDate && (
            <p className="mt-1 text-xs text-gray-500">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}
          
          {task.labels && task.labels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {task.labels.map((label, index) => (
                <span key={index} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon name="edit" className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Icon name="delete" className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
