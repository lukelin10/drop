import { QueryClient } from "@tanstack/react-query";

export type ApiErrorType = {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
};

export type QueryFnOptions = {
  on401?: "returnError" | "returnNull" | "throwError";
};

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export const apiRequest = async (
  method: HttpMethod,
  endpoint: string,
  data?: unknown,
  customHeaders?: Record<string, string>
) => {
  // Ensure endpoint starts with the correct base URL
  // We'll use relative URLs which will work in both development and production
  const url = endpoint.startsWith('http') ? endpoint : `${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...customHeaders,
    },
    credentials: "include",
  };

  if (data && method !== "GET") {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let errorData: ApiErrorType = {
      status: response.status,
      message: "An error occurred",
    };

    try {
      errorData = await response.json();
    } catch (e) {
      errorData.message = response.statusText || "An unknown error occurred";
    }

    const error = new Error(errorData.message || "An error occurred");
    (error as any).status = errorData.status;
    (error as any).errors = errorData.errors;
    throw error;
  }

  return response;
};

export const getQueryFn =
  (options: QueryFnOptions = {}) =>
  // Updated to match TanStack Query v5 context type
  async ({ queryKey }: { queryKey: readonly unknown[] }) => {
    try {
      // Convert queryKey to string array when joining
      const endpoint = queryKey.map(String).join("/");
      const response = await apiRequest("GET", endpoint);
      
      if (response.status === 204) {
        return null;
      }
      
      return await response.json();
    } catch (error: any) {
      if (error.status === 401) {
        if (options.on401 === "returnNull") {
          return null;
        } else if (options.on401 === "returnError" || !options.on401) {
          throw error;
        }
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      // Remove the default queryFn to avoid typing issues
      // This means we'll need to provide the queryFn for each query
    },
  },
});