const getEnv = (key, fallback) => {
  const value = import.meta.env?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
};

const getRequiredEnv = (key) => {
  const value = import.meta.env?.[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`❌ Missing required environment variable: ${key}. Check your .env file.`);
  }
  return value.trim();
};

const getEnvList = (key, fallback) => {
  const value = import.meta.env?.[key];

  if (!value?.trim()) return fallback;

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

// --- Non-sensitive service URLs (safe localhost fallbacks for dev) ---

export const API_BASE_URL = getEnv(
  "VITE_API_BASE_URL",
  "http://localhost:5000/api"
);

export const SIGNALR_HUB_URL = getEnv(
  "VITE_SIGNALR_HUB_URL",
  "http://localhost:5000/documentHub"
);

export const ONLYOFFICE_DOCUMENT_SERVER_URL = getEnv(
  "VITE_ONLYOFFICE_DOCUMENT_SERVER_URL",
  "http://localhost/"
);

// --- Sensitive Azure AD credentials (MUST be set in .env) ---

export const MSAL_CLIENT_ID = getRequiredEnv("VITE_MSAL_CLIENT_ID");

export const MSAL_AUTHORITY = getRequiredEnv("VITE_MSAL_AUTHORITY");

export const MSAL_REDIRECT_URI = getEnv(
  "VITE_MSAL_REDIRECT_URI",
  "http://localhost:3000"
);

export const MSAL_SCOPES = getEnvList("VITE_MSAL_SCOPES", ["User.Read"]);

export const appConfig = {
  apiBaseUrl: API_BASE_URL,
  signalrHubUrl: SIGNALR_HUB_URL,
  onlyOfficeDocumentServerUrl: ONLYOFFICE_DOCUMENT_SERVER_URL,
  msal: {
    clientId: MSAL_CLIENT_ID,
    authority: MSAL_AUTHORITY,
    redirectUri: MSAL_REDIRECT_URI,
    scopes: MSAL_SCOPES,
  },
};
