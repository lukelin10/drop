import React from 'react';
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
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/journal" component={JournalPage} />
      <ProtectedRoute path="/question" component={QuestionPage} />
      <ProtectedRoute path="/conversation/:id" component={ConversationPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;