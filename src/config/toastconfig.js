export const toastConfig = {
    position: "top-right",
    toastOptions: {
      duration: 3000,
      style: {
        background: "rgba(15, 23, 42, 0.85)",
        color: "#fff",
        borderRadius: "12px",
        padding: "12px 16px",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
        fontSize: "14px"
      },
      success: {
        iconTheme: {
          primary: "#22c55e",
          secondary: "#ecfdf5"
        }
      },
      error: {
        iconTheme: {
          primary: "#ef4444",
          secondary: "#fef2f2"
        }
      }
    }
  };