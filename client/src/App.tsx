import React, { useEffect } from 'react';
import { Route, Switch } from 'wouter';
import { Toaster } from './components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './hooks/use-auth';
import { ProtectedRoute } from './lib/protected-route';

// Pages
import HomePage from './pages/home-page';
import JournalPage from './pages/journal-page';
import AuthPage from './pages/auth-page';
import QuestionPage from './pages/question-page';
import ConversationPage from './pages/conversation-page';
import NotFoundPage from './pages/not-found-page';

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
    console.log('[App] Window location:', window.location.href);
    console.log('[App] Available routes:', {
      HOME: AppRoutes.HOME,
      AUTH: AppRoutes.AUTH,
      JOURNAL: AppRoutes.JOURNAL,
      DAILY_QUESTION: AppRoutes.DAILY_QUESTION,
      CONVERSATION: AppRoutes.CONVERSATION,
    });
    return () => console.log('[App] Component unmounted');
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Drop - Journal App</h1>
        <p className="text-xl">Debug version - Checking rendering</p>
        <div className="mt-8 p-4 bg-white rounded shadow">
          <p>Current time: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
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
          return <NotFoundPage />;
        }}
      </Route>
    </Switch>
  );
}

export default App;