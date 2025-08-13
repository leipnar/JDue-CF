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