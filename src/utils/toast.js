import toast from "react-hot-toast";

export const showSuccess = (message) => {
  toast.success(message, {
    style: {
      borderLeft: "4px solid #22c55e"
    }
  });
};

export const showError = (message) => {
  toast.error(message, {
    style: {
      borderLeft: "4px solid #ef4444"
    }
  });
};

export const showInfo = (message) => {
  toast(message, {
    icon: "ℹ️",
    style: {
      borderLeft: "4px solid #6366f1"
    }
  });
};