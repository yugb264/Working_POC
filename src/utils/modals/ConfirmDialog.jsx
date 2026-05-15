import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          background: "linear-gradient(145deg, #1e293b, #0f172a)",
          padding: "1.5rem",
          borderRadius: "12px",
          width: "360px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          ⚠️
        </div>

        <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
          {title}
        </h3>

        <div style={{
          fontSize: "0.9rem",
          color: "#cbd5f5",
          marginBottom: "1.5rem"
        }}>
          {message}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              background: "#ef4444",
              border: "none",
              color: "white",
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}