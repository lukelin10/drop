import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "./use-toast";
import { signInWithGoogle, handleGoogleRedirect } from "../lib/firebase";

// Re-define types locally since we can't import directly from shared/schema
type User = {
  id: number;
  username: string;
  email: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  lastLogin?: Date | null;
  preferredTheme?: string | null;
  notificationPreferences?: string | null;
};

type LoginInput = {
  username: string;
  password: string;
};

type RegisterInput = LoginInput & {
  email: string;
  confirmPassword: string;
};

type GoogleAuthInput = {
  email: string;
  displayName: string | null;
  uid: string;
  photoURL: string | null;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginInput>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterInput>;
  googleLoginMutation: UseMutationResult<void, Error, void>;
  isCheckingRedirect: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);
  
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser
  } = useQuery<User>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/user');
        if (!res.ok) {
          if (res.status === 401) {
            // Not authenticated, this is fine
            return null;
          }
          throw new Error('Failed to fetch user');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
  });

  const loginMutation = useMutation<User, Error, LoginInput>({
    mutationFn: async (credentials: LoginInput) => {
      const res = await apiRequest('POST', '/api/login', credentials);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Invalid username or password');
      }
      return await res.json();
    },
    onSuccess: (data: User) => {
      queryClient.setQueryData(['/api/user'], data);
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation<User, Error, RegisterInput>({
    mutationFn: async (userData: RegisterInput) => {
      const res = await apiRequest('POST', '/api/register', userData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      return await res.json();
    },
    onSuccess: (data: User) => {
      queryClient.setQueryData(['/api/user'], data);
      toast({
        title: "Registration successful",
        description: `Welcome, ${data.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/logout');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Logout failed');
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Google authentication mutations
  const googleLoginMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await signInWithGoogle();
    },
    onError: (error: Error) => {
      toast({
        title: "Google login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const googleAuthMutation = useMutation<User, Error, GoogleAuthInput>({
    mutationFn: async (googleData: GoogleAuthInput) => {
      const res = await apiRequest('POST', '/api/google-auth', googleData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Google authentication failed');
      }
      return await res.json();
    },
    onSuccess: (data: User) => {
      queryClient.setQueryData(['/api/user'], data);
      toast({
        title: "Google login successful",
        description: `Welcome${data.username ? ', ' + data.username : ''}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Google authentication failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle Firebase auth redirect
  useEffect(() => {
    const checkGoogleRedirect = async () => {
      try {
        setIsCheckingRedirect(true);
        const result = await handleGoogleRedirect();
        
        if (result?.user) {
          const { user: googleUser } = result;
          
          // Call our API to handle Google authentication
          await googleAuthMutation.mutateAsync({
            email: googleUser.email || '',
            displayName: googleUser.displayName,
            uid: googleUser.uid,
            photoURL: googleUser.photoURL,
          });
        }
      } catch (error) {
        console.error('Error handling Google redirect:', error);
      } finally {
        setIsCheckingRedirect(false);
      }
    };

    checkGoogleRedirect();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        googleLoginMutation,
        isCheckingRedirect
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}