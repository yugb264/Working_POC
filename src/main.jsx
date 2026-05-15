import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./config/authConfig";

createRoot(document.getElementById('root')).render(
 
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  
);