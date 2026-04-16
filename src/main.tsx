import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { installAuthFetch } from './authFetch'

// Install the auth-aware fetch wrapper BEFORE any component mounts so every
// request from the app flows through it.
installAuthFetch()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
