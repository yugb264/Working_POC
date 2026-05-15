import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../config/authConfig";

export const useAuthToken = () => {
  const { instance, accounts } = useMsal();

  const getToken = async () => {
    if (!accounts || accounts.length === 0) {
      throw new Error("No active account! User not logged in.");
    }

    const response = await instance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });

    return response.accessToken;
  };

  return { getToken };
};