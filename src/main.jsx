import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./config/authConfig";

import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </BrowserRouter>
);
