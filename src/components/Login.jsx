import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../config/authConfig";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const MicrosoftLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

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
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Animated gradient background
        background: "linear-gradient(-45deg, #0f172a, #1e1b4b, #0f172a, #172554)",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
        zIndex: 9999, // Ensure it covers the whole screen
      }}
    >
      <style>
        {`
          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .ms-signin-btn {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
          }
          .ms-signin-btn:hover {
            background: rgba(255, 255, 255, 0.12) !important;
            border-color: rgba(255, 255, 255, 0.3) !important;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
          }
        `}
      </style>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "3.5rem 2.5rem",
          textAlign: "center",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
           style={{
             display: 'flex',
             justifyContent: 'center',
             marginBottom: '1.5rem'
           }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            padding: '14px',
            borderRadius: '20px',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
          }}>
            <FileText size={40} color="white" strokeWidth={2} />
          </div>
        </motion.div>

        <h2
          style={{
            marginBottom: "0.5rem",
            fontSize: "28px",
            fontWeight: 700,
            background: "linear-gradient(to right, #ffffff, #a5b4fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px"
          }}
        >
          MyOffice Docs
        </h2>

        <p
          style={{
            color: "var(--text-muted)",
            marginBottom: "2.5rem",
            fontSize: "15px",
            lineHeight: 1.6
          }}
        >
          Secure collaborative document editing. <br /> Sign in to access your workspace.
        </p>

        <motion.button
          onClick={handleLogin}
          whileHover={{ scale: 1.03, translateY: -2 }}
          whileTap={{ scale: 0.97 }}
          className="ms-signin-btn"
          style={{
            width: "100%",
            padding: "14px 20px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            transition: "all 0.3s ease",
            backdropFilter: "blur(10px)",
          }}
        >
          <MicrosoftLogo />
          Sign in with Microsoft
        </motion.button>
      </motion.div>
    </div>
  );
}