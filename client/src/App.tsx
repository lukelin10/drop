import React, { useEffect } from 'react';
import { Route, Switch, useLocation, useRedirect } from 'wouter';
import { Toaster } from './components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider, useAuth } from './hooks/use-auth';
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

// Component that redirects based on auth status
function AuthRedirect() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const redirect = useRedirect();
  
  useEffect(() => {
    // Don't redirect if still loading auth state
    if (isLoading) return;
    
    // If user is logged in and trying to access auth page, 
    // redirect to home page
    if (user && location === AppRoutes.AUTH) {
      console.log('[AuthRedirect] User is authenticated, redirecting to home');
      redirect(AppRoutes.HOME);
    }
    
    // If user is not logged in and trying to access root page,
    // redirect to auth page
    if (!user && location === AppRoutes.HOME) {
      console.log('[AuthRedirect] User is not authenticated, redirecting to auth');
      redirect(AppRoutes.AUTH);
    }
  }, [user, location, isLoading, redirect]);
  
  return null;
}

function App() {
  console.log('[App] Rendering main app component');
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background font-sans antialiased">
          <AppRouter />
          <Toaster />
        </div>
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
    <>
      {/* Component that handles automatic redirects based on auth state */}
      <AuthRedirect />
      
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
                  component={(props: any) => <Component {...props} params={params} />} 
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
    </>
  );
}

export default App;