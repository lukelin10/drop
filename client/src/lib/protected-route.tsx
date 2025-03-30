import React from 'react';
import { useAuth } from '../hooks/use-auth';
import { Route, Redirect } from 'wouter';

/**
 * A component that protects routes from unauthenticated users
 * If a user is not logged in, they are redirected to the auth page
 * If the auth status is still loading, a loading spinner is shown
 */
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType<any>;
}) {
  const { user, isLoading } = useAuth();
  
  // Debugging information
  React.useEffect(() => {
    console.log(`[ProtectedRoute:${path}] Rendering with auth state:`, { 
      isAuthenticated: !!user, 
      isLoading,
      userInfo: user ? `User ID: ${user.id}` : 'No user'
    });
  }, [path, user, isLoading]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    console.log(`[ProtectedRoute:${path}] User not authenticated, redirecting to /auth`);
    return <Redirect to="/auth" />;
  }

  // User is authenticated, render the protected component
  console.log(`[ProtectedRoute:${path}] User authenticated, rendering component`);
  return <Component />;
}