import * as signalR from "@microsoft/signalr";
import { SIGNALR_HUB_URL } from "../config/appConfig";

let connection = null;

export const startConnection = async () => {
  if (connection) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(SIGNALR_HUB_URL)
    .withAutomaticReconnect()
    .build();

  await connection.start();
  console.log("✅ SignalR Connected");

  return connection;
};

export const getConnection = () => connection;
