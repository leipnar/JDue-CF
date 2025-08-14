import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.2'; // Fallback to current version
  
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-center p-4 mt-auto text-sm text-gray-500 dark:text-gray-400">
      <div className="container mx-auto flex justify-between items-center">
        <span>
          © {currentYear} Leipnar
        </span>
        <span>
          Version {appVersion}
        </span>
      </div>
    </footer>
  );
};

export default Footer;
