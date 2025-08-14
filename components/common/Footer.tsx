import React from 'react';

const Footer: React.FC = () => {
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
  
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-center p-4 mt-auto text-sm text-gray-500 dark:text-gray-400">
      <div className="container mx-auto">
        <p>
          © 2024 JDue Todo App. Version {appVersion}
        </p>
        <p className="mt-1">
          Built with React & TypeScript
        </p>
      </div>
    </footer>
  );
};

export default Footer;
