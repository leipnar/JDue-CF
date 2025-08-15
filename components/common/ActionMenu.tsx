import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

interface ActionMenuProps {
  actions: Array<{
    label: string;
    onClick: () => void;
    className?: string;
    icon?: string;
  }>;
  className?: string;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ actions, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleActionClick = (action: any) => {
    try {
      setIsOpen(false);
      action.onClick();
    } catch (error) {
      console.error('Action menu error:', error);
      setIsOpen(false);
    }
  };

  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
        type="button"
      >
        <Icon name="dots-vertical" className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-8 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[150px] max-w-xs">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors ${action.className || ''}`}
              type="button"
            >
              {action.icon && <Icon name={action.icon} className="w-4 h-4" />}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
