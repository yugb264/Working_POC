import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../config/authConfig";

export default function Login() {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect({
      ...loginRequest,
      prompt: "select_account",
    });
  };

  return (
    <div
      className="glass-panel"
      style={{
        maxWidth: "420px",
        margin: "120px auto",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          fontWeight: 600,
        }}
      >
      
        Login 
      </h2>

      <p
        style={{
          color: "var(--text-muted)",
          marginBottom: "2rem",
          fontSize: "14px",
        }}
      >
        Securely sign in using your Microsoft account
      </p>

      <button
        onClick={handleLogin}
        style={{
          width: "100%",
          padding: "12px 20px",
          borderRadius: "10px",
          border: "none",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff",
          fontSize: "15px",
          fontWeight: "500",
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: "0 6px 16px rgba(99, 102, 241, 0.35)",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0)";
        }}
      >
        Sign In
      </button>
    </div>
  );
}