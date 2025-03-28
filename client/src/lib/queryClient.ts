import { QueryClient } from '@tanstack/react-query';

export type ApiErrorType = {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
};

export type QueryFnOptions = {
  on401?: 'returnError' | 'returnNull' | 'throwError';
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const apiRequest = async (
  method: HttpMethod,
  url: string,
  body?: Record<string, any>,
): Promise<Response> => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let errorData: ApiErrorType = {
      status: response.status,
      message: response.statusText,
    };

    try {
      const data = await response.json();
      errorData = {
        ...errorData,
        message: data.message || errorData.message,
        errors: data.errors,
      };
    } catch (e) {
      // If JSON parsing fails, use the original error
    }

    const error = new Error(errorData.message) as Error & ApiErrorType;
    error.status = errorData.status;
    error.errors = errorData.errors;

    throw error;
  }

  return response;
};

export const getQueryFn =
  (options: QueryFnOptions = {}) =>
  async ({ queryKey }: { queryKey: string[] }): Promise<any> => {
    try {
      const [url] = queryKey;

      const response = await apiRequest('GET', url);
      return await response.json();
    } catch (error: any) {
      if (error.status === 401 && options.on401) {
        if (options.on401 === 'returnNull') {
          return null;
        }
        if (options.on401 === 'returnError') {
          return { error };
        }
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});