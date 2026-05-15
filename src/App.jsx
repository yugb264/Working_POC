import { useIsAuthenticated } from "@azure/msal-react";
import Login from "./components/Login";
import ProtectedApp from "./ProtectedApp";
import { Toaster } from "react-hot-toast";
import { toastConfig } from "./config/toastconfig";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <ErrorBoundary>
      <Toaster {...toastConfig} />
      {isAuthenticated ? <ProtectedApp /> : <Login />}
    </ErrorBoundary>
  );
}
