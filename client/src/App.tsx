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
            <Router />
          </main>
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function Router() {
  useEffect(() => {
    console.log('[Router] Component mounted');
    console.log('[Router] Current location:', window.location.pathname);
    return () => console.log('[Router] Component unmounted');
  }, []);

  console.log('[Router] Rendering router component');
  
  return (
    <Switch>
      <Route path="/auth">
        {() => {
          console.log('[Router] /auth route matched');
          return <AuthPage />;
        }}
      </Route>
      <Route path="/">
        {() => {
          console.log('[Router] / route matched');
          return <ProtectedRoute path="/" component={HomePage} />;
        }}
      </Route>
      <Route path="/journal">
        {() => {
          console.log('[Router] /journal route matched');
          return <ProtectedRoute path="/journal" component={JournalPage} />;
        }}
      </Route>
      <Route path="/daily-question">
        {() => {
          console.log('[Router] /daily-question route matched');
          return <ProtectedRoute path="/daily-question" component={QuestionPage} />;
        }}
      </Route>
      <Route path="/conversation/:id">
        {(params) => {
          console.log('[Router] /conversation/:id route matched', params);
          return <ProtectedRoute path={`/conversation/${params.id}`} component={ConversationPage} />;
        }}
      </Route>
      <Route>
        {() => {
          console.log('[Router] Not found route matched');
          return <NotFound />;
        }}
      </Route>
    </Switch>
  );
}

export default App;