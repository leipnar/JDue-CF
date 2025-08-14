import React from 'react';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onEdit, onDelete }) => {
  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle?.(task)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            task.completed 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-gray-300'
          }`}
        >
          {task.completed && '✓'}
        </button>
        
        <div className="flex-1">
          <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
          )}
          <span className="text-xs text-gray-500">Priority: {task.priority}</span>
        </div>
        
        <div className="flex gap-2">
          {onEdit && (
            <button onClick={() => onEdit(task)} className="text-blue-600 text-sm">
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(task.id)} className="text-red-600 text-sm">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
