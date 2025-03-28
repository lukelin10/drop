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
  component: React.ComponentType;
}) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        return <Component />;
      }}
    </Route>
  );
}