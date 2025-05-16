import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

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
 * Handle API errors with toast notifications
 * @param error The error object
 * @param title Optional custom title for the toast
 * @returns The extracted error message
 */
export const handleApiError = (error: any, title?: string): string => {
  console.error('API Error:', error);
  
  const errorMessage = getErrorMessage(error);
  
  // Show toast notification
  toast({
    title: title || "Error",
    description: errorMessage,
    variant: "destructive"
  });
  
  return errorMessage;
};

/**
 * Wrapper for fetch API that handles errors with toast notifications
 */
export const fetchWithErrorHandling = async (
  url: string, 
  options: RequestInit = {}
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
      
      // Throw error with message from response
      throw new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
    }
    
    return response;
  } catch (error) {
    // Handle error with toast
    handleApiError(error);
    throw error; // Re-throw for component-level handling
  }
}; 