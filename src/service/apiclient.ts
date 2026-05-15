import axios from "axios";
import { API_BASE_URL } from "../config/apiconfig";
import { msalInstance } from "../config/authConfig";
import { loginRequest } from "../config/authConfig";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// 🔐 Attach token automatically
apiClient.interceptors.request.use(async (config) => {
  const accounts = msalInstance.getAllAccounts();

  if (accounts.length > 0) {
    try {
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });

      config.headers.Authorization = `Bearer ${response.accessToken}`;
    } catch (error) {
      console.error("Token error:", error);
    }
  }

  return config;
});
apiClient.interceptors.response.use(
    (response) => response,
  
    async (error) => {
      const status = error.response?.status;
  
      console.error("🌐 API ERROR:", {
        status,
        url: error.config?.url,
        message: error.message
      });
  
      // 🔒 401 Unauthorized → force logout
      if (status === 401) {
        console.warn("🔐 Session expired or unauthorized → logging out");
  
        // Proper MSAL logout instead of nuking localStorage
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
           msalInstance.logoutRedirect({
              account: accounts[0]
           });
        } else {
           window.location.href = "/";
        }
      }
  
      // ❗ Other errors (optional handling)
      if (status === 500) {
        console.error("🔥 Server error");
      }
  
      return Promise.reject(error);
    }
  );
export default apiClient;