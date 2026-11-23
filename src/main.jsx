import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { StoreProvider } from './lib/store';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <App />
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Register service worker for offline catalogue browsing
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Track visits for dismissible PWA add-to-home-screen prompt
try {
  const visits = parseInt(localStorage.getItem('sj_visit_count') || '0', 10);
  localStorage.setItem('sj_visit_count', String(visits + 1));
} catch {}
