import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

interface ActionMenuItem {
  label: string;
  action: string;
  icon?: string;
  className?: string;
  disabled?: boolean;
}

interface ActionMenuProps {
  actions: ActionMenuItem[];
  onAction: (action: string) => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  actions,
  onAction,
  position = 'bottom-right',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleActionClick = (action: string) => {
    try {
      setIsOpen(false);
      onAction(action);
    } catch (error) {
      console.error('Error executing action:', error);
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'top-full left-0 mt-1';
      case 'bottom-right':
        return 'top-full right-0 mt-1';
      case 'top-left':
        return 'bottom-full left-0 mb-1';
      case 'top-right':
        return 'bottom-full right-0 mb-1';
      default:
        return 'top-full right-0 mt-1';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Icon name="more-horizontal" size={16} className="text-gray-500 dark:text-gray-400" />
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 z-10 md:hidden" onClick={() => setIsOpen(false)} />
          
          {/* Menu */}
          <div
            ref={menuRef}
            className={`
              absolute z-50 min-w-48 
              bg-white dark:bg-gray-800 
              border border-gray-200 dark:border-gray-600 
              rounded-md shadow-lg 
              py-1
              ${getPositionClasses()}
            `}
            role="menu"
            aria-orientation="vertical"
          >
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleActionClick(action.action)}
                disabled={action.disabled}
                className={`
                  w-full text-left px-4 py-2 text-sm 
                  flex items-center space-x-3
                  hover:bg-gray-100 dark:hover:bg-gray-700 
                  focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                  ${action.className || 'text-gray-700 dark:text-gray-300'}
                  ${index > 0 && action.className?.includes('border-t') ? 'border-t pt-2 mt-1' : ''}
                `}
                role="menuitem"
              >
                {action.icon && (
                  <Icon 
                    name={action.icon as any} 
                    size={16} 
                    className="flex-shrink-0" 
                  />
                )}
                <span className="flex-1">{action.label}</span>
              </button>
            ))}

            {actions.length === 0 && (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                No actions available
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ActionMenu;