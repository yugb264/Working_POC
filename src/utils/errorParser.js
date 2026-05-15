export const parseApiError = (error, defaultMessage = "An error occurred") => {
  if (error?.response?.data) {
    const responseData = error.response.data;

    // Handle structured FluentValidation errors under the 'data' key
    if (responseData.data && typeof responseData.data === 'object') {
      const allErrors = [];
      for (const key in responseData.data) {
        if (Array.isArray(responseData.data[key])) {
          allErrors.push(...responseData.data[key]);
        }
      }
      
      if (allErrors.length > 0) {
        return allErrors[0]; // the user requested just the message string, we'll return the first validation error
      }
    }

    // Fallback: check for standard 'message' field
    if (responseData.message && responseData.message !== "Validation failed") {
      return responseData.message;
    }
  }

  return defaultMessage;
};
