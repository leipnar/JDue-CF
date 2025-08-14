import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <span>© {currentYear} Leipnar</span>
        <span>Version 1.0.2</span>
      </div>
    </footer>
  );
};

export default Footer;
