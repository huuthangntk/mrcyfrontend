import { toast } from "@/components/ui/use-toast";

/**
 * Extract error message from various error formats
 */
export const getErrorMessage = (error: any): string => {
  // Try to extract error message from different possible formats
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.response?.data?.error) {
    return error.response.data.error;
  } else if (error.message) {
    return error.message;
  } else if (typeof error === 'string') {
    return error;
  }
  
  return "An unexpected error occurred";
};

/**
 * Extract error code from error response
 */
export const getErrorCode = (error: any): string | null => {
  // Try to extract error code
  if (error.response?.data?.code) {
    return error.response?.data?.code;
  }
  return null;
};

/**
 * Handle API errors with toast notifications
 * @param error The error object
 * @param translateFn Optional translation function
 * @param title Optional custom title for the toast
 * @returns The extracted error message
 */
export const handleApiError = (
  error: any, 
  translateFn?: (key: string) => string,
  title?: string
): string => {
  console.error('API Error:', error);
  
  const errorMessage = getErrorMessage(error);
  const errorCode = getErrorCode(error);
  
  // Show toast notification
  toast({
    title: title || "Error",
    description: errorCode && translateFn ? translateFn(`auth.${errorCode}`) : errorMessage,
    variant: "destructive"
  });
  
  return errorMessage;
};

/**
 * Wrapper for fetch API that handles errors with toast notifications
 */
export const fetchWithErrorHandling = async (
  url: string, 
  options: RequestInit = {},
  translateFn?: (key: string) => string
): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // Try to parse error response
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // If parsing fails, use status text
        throw new Error(response.statusText || `Request failed with status ${response.status}`);
      }
      
      // Add code to the error object if available
      const error = new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
      if (errorData.code) {
        (error as any).code = errorData.code;
      }
      throw error;
    }
    
    return response;
  } catch (error) {
    // Handle error with toast
    handleApiError(error, translateFn);
    throw error; // Re-throw for component-level handling
  }
}; 