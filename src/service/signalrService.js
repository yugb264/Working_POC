import * as signalR from "@microsoft/signalr";
import { SIGNALR_HUB_URL } from "../config/appConfig";
import { msalInstance, loginRequest } from "../config/authConfig";

let connection = null;

const getAccessToken = async () => {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) return null;

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });
    return response.accessToken;
  } catch (error) {
    console.error("❌ SignalR token acquisition failed:", error);
    return null;
  }
};

export const startConnection = async () => {
  if (connection) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(SIGNALR_HUB_URL, {
      accessTokenFactory: getAccessToken,
    })
    .withAutomaticReconnect()
    .build();

  try {
    await connection.start();
    console.log("✅ SignalR Connected");
  } catch (error) {
    console.error("❌ SignalR connection failed:", error);
    connection = null;
  }

  return connection;
};

export const getConnection = () => connection;
