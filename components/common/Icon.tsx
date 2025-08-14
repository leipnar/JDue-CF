import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

const Icon: React.FC<IconProps> = ({ name, className = '', size = 24 }) => {
  // Fallback for missing icons
  const iconMap: Record<string, string> = {
    'dot': '•',
    'circle': '○',
    'plus': '+',
    'minus': '-',
    'profile': '👤',
    'calendar': '📅',
    'folder': '📁',
    'settings': '⚙️',
    'logout': '🚪',
    'default': '□'
  };

  const iconChar = iconMap[name] || iconMap['default'];

  return (
    <span 
      className={`inline-block text-center ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        lineHeight: `${size}px`,
        fontSize: `${size * 0.7}px` 
      }}
    >
      {iconChar}
    </span>
  );
};

export default Icon;
