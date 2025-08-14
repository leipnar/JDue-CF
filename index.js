import React from 'react';
import { createRoot } from 'react-dom/client';

// Simple React component for testing
function App() {
  const [count, setCount] = React.useState(0);
  
  return React.createElement('div', {
    style: {
      padding: '20px',
      fontFamily: 'Inter, sans-serif',
      textAlign: 'center'
    }
  }, [
    React.createElement('h1', { key: 'title' }, 'JDue Todo App'),
    React.createElement('p', { key: 'desc' }, 'React app is loading successfully!'),
    React.createElement('div', { 
      key: 'counter',
      style: { margin: '20px 0' }
    }, [
      React.createElement('button', {
        key: 'btn',
        onClick: () => setCount(count + 1),
        style: {
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer'
        }
      }, `Count: ${count}`)
    ]),
    React.createElement('p', { 
      key: 'api',
      style: { fontSize: '14px', color: '#666' }
    }, 'API URL: https://jdue-api.ditrust.workers.dev/api')
  ]);
}

// Render the app
const container = document.getElementById('root');
const root = createRoot(container);
root.render(React.createElement(App));
