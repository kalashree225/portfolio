import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './theme.css'
import './index.css'
import './m3-overrides.css'
import App from './App.tsx'

// GitHub Pages project sites live under /portfolio/. React Router needs the
// same prefix as Vite's base so routes like /work still match after deployment.
const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
