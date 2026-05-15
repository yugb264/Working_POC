import * as signalR from "@microsoft/signalr";

let connection = null;

export const startConnection = async () => {
  if (connection) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/documentHub")
    .withAutomaticReconnect()
    .build();

  await connection.start();
  console.log("✅ SignalR Connected");

  return connection;
};

export const getConnection = () => connection;