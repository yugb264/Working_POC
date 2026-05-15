import { PublicClientApplication } from "@azure/msal-browser";
import {
  MSAL_AUTHORITY,
  MSAL_CLIENT_ID,
  MSAL_REDIRECT_URI,
  MSAL_SCOPES,
} from "./appConfig";

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: MSAL_CLIENT_ID,
    authority: MSAL_AUTHORITY,
    redirectUri: MSAL_REDIRECT_URI,
  },
  
});

export const loginRequest = {
  scopes: MSAL_SCOPES
};
