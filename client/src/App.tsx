import React, { useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { Toaster } from './components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './hooks/use-auth';
import { ProtectedRoute } from './lib/protected-route';

// Pages
import HomePage from './pages/Home';
import JournalPage from './pages/Journal';
import AuthPage from './pages/auth-page';
import QuestionPage from './pages/QuestionPage';
import ConversationPage from './pages/ConversationPage';
import NotFound from './pages/not-found';

// Define the parameter types for routes
type RouteParams = {
  id?: string;
  [key: string]: string | undefined;
};

// Define application routes in a centralized way
const AppRoutes = {
  HOME: '/',
  AUTH: '/auth',
  JOURNAL: '/journal',
  DAILY_QUESTION: '/daily-question',
  CONVERSATION: '/conversation/:id',
}

// Define which routes need authentication
const ProtectedRoutes = [
  { path: AppRoutes.HOME, Component: HomePage },
  { path: AppRoutes.JOURNAL, Component: JournalPage },
  { path: AppRoutes.DAILY_QUESTION, Component: QuestionPage },
  { path: AppRoutes.CONVERSATION, Component: ConversationPage },
];

// Define public routes (no auth required)
const PublicRoutes = [
  { path: AppRoutes.AUTH, Component: AuthPage },
];

function App() {
  useEffect(() => {
    console.log('[App] Component mounted');
    return () => console.log('[App] Component unmounted');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background font-sans antialiased">
          <main className="flex flex-col">
            <AppRouter />
          </main>
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppRouter() {
  useEffect(() => {
    console.log('[AppRouter] Component mounted');
    console.log('[AppRouter] Current location:', window.location.pathname);
    return () => console.log('[AppRouter] Component unmounted');
  }, []);

  return (
    <Switch>
      {/* Public routes first */}
      {PublicRoutes.map(({ path, Component }) => (
        <Route key={path} path={path}>
          {(params: RouteParams) => {
            console.log(`[AppRouter] Route matched: ${path}`, params);
            return <Component />;
          }}
        </Route>
      ))}

      {/* Protected routes */}
      {ProtectedRoutes.map(({ path, Component }) => (
        <Route key={path} path={path}>
          {(params: RouteParams) => {
            console.log(`[AppRouter] Protected route matched: ${path}`, params);
            return (
              <ProtectedRoute 
                path={path.includes(':') 
                  ? path.replace(':id', params.id || '') 
                  : path} 
                component={() => <Component />} 
              />
            );
          }}
        </Route>
      ))}

      {/* 404 route - must be last */}
      <Route>
        {(params: RouteParams) => {
          console.log('[AppRouter] 404 route matched', params);
          return <NotFound />;
        }}
      </Route>
    </Switch>
  );
}

export default App;