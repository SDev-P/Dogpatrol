import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { PawPatrolProvider } from './context/PawPatrolContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PawPatrolProvider>
      <App />
    </PawPatrolProvider>
  </React.StrictMode>,
);

