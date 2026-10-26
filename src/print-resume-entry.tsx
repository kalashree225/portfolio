import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './theme.css';
import './index.css';
import PrintResume from './pages/PrintResume';

/**
 * Entry for the PDF build only. Renders the résumé with the real site
 * stylesheet so the printed document and the on-screen canvas match.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrintResume />
  </StrictMode>,
);
