import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// StrictMode disabled to prevent socket connection spam in development
// due to double-mounting behavior
createRoot(document.getElementById('root')!).render(
  <App />
);
