const getEnv = (key, fallback) => {
  const value = import.meta.env?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
};

const getEnvList = (key, fallback) => {
  const value = import.meta.env?.[key];

  if (!value?.trim()) return fallback;

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

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

export const MSAL_CLIENT_ID = getEnv(
  "VITE_MSAL_CLIENT_ID",
  "12dd1eb5-32c5-488d-82f3-fbdcefd7ad19"
);

export const MSAL_AUTHORITY = getEnv(
  "VITE_MSAL_AUTHORITY",
  "https://login.microsoftonline.com/7eb749a1-a2ec-4260-bb87-c77c7a0a0b7a"
);

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
