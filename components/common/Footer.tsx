import React, { useState, useEffect } from 'react';

const Footer: React.FC = () => {
  const [appVersion, setAppVersion] = useState('');
  const [copyrightHolder, setCopyrightHolder] = useState('Leipnar');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch('/metadata.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        setCopyrightHolder(data.copyrightHolder || 'Leipnar');
        setAppVersion(data.version || 'N/A');

      } catch (error) {
        console.error('Error fetching metadata:', error);
        setAppVersion('N/A');
      }
    };

    fetchMetadata();
  }, []);

  return (
    <footer className="w-full shrink-0 border-t border-slate-200 dark:border-dark-border">
      <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 py-3 px-4 sm:px-6 lg:px-8">
        <span>&copy; {currentYear} {copyrightHolder}</span>
        {appVersion && <span>Version {appVersion}</span>}
      </div>
    </footer>
  );
};

export default Footer;

// In src/components/common/Footer.tsx

import React from 'react';

// Vite exposes environment variables on the `import.meta.env` object.
const appVersion = import.meta.env.VITE_APP_VERSION;

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-center p-4 mt-auto text-sm text-gray-500 dark:text-gray-400">
      <div className="container mx-auto">
        <p>
          <span>&copy; {new Date().getFullYear()} Leipnar</span>
          {/* This will only render the version if it exists */}
          {appVersion && (
            <span className="ml-4">
              Version: {appVersion}
            </span>
          )}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
