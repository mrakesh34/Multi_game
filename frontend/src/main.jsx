/**
 * FILE: frontend/src/main.jsx
 * PURPOSE: React application bootstrap — the single entry point.
 *
 * WHAT THIS FILE DOES:
 *   - Imports global CSS (Tailwind + design tokens) from index.css
 *   - Calls ReactDOM.createRoot() on the #root div in index.html
 *   - Wraps the entire app in <React.StrictMode> for dev-mode warnings
 *   - Renders <App /> which contains all routes
 *
 * DO NOT put any business logic, socket connections, or store code here.
 * This file should stay minimal — just the mounting call.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
