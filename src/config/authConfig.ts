import { PublicClientApplication } from "@azure/msal-browser";

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: "12dd1eb5-32c5-488d-82f3-fbdcefd7ad19",
    authority: "https://login.microsoftonline.com/7eb749a1-a2ec-4260-bb87-c77c7a0a0b7a",
    redirectUri: "http://localhost:3000",
  },
  
});

export const loginRequest = {
  scopes: ["User.Read"]
};