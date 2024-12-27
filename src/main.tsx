import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import { TransactionProvider } from './contexts/TransactionContext';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Failed to find root element. Make sure there is a <div id="root"></div> in your index.html'
  );
}

// Create root outside of render to avoid potential memory leaks
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <AuthProvider>
      <TransactionProvider>
        <App />
      </TransactionProvider>
    </AuthProvider>
  </StrictMode>
);
