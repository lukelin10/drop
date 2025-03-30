import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { Redirect } from 'wouter';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

// Form schemas
const loginSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const registerSchema = loginSchema.extend({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  console.log('[AuthPage] Component rendering');

  useEffect(() => {
    console.log('[AuthPage] Component mounted');
    console.log('[AuthPage] Current location:', window.location.pathname);
    return () => console.log('[AuthPage] Component unmounted');
  }, []);

  const { user, loginMutation, registerMutation, googleLoginMutation, isCheckingRedirect } = useAuth();
  console.log('[AuthPage] Auth state:', { user, isLoading: loginMutation.isPending, isCheckingRedirect });
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };
  
  const onRegisterSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values);
  };

  // Redirect if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Form Section */}
      <div className="w-full lg:w-1/2 p-8 flex items-center justify-center bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Drop</h1>
            <p className="text-muted-foreground">Your daily reflection journal</p>
          </div>
          
          {authMode === 'login' ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-primary">Log in</h2>
              
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div>
                  <input
                    id="login-username"
                    type="text"
                    placeholder="Email address"
                    {...loginForm.register('username')}
                    className="w-full p-4 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-card"
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-destructive text-sm mt-1">
                      {loginForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="Password"
                    {...loginForm.register('password')}
                    className="w-full p-4 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-card"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-destructive text-sm mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <div className="text-right">
                  <a href="#" className="text-primary text-sm hover:underline">
                    Forgot password?
                  </a>
                </div>
                
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full p-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 text-lg font-medium"
                >
                  {loginMutation.isPending ? 'Logging in...' : 'Log in'}
                </button>
                
                <div className="flex items-center my-6">
                  <div className="flex-grow h-px bg-border"></div>
                  <div className="px-4 text-muted-foreground">or</div>
                  <div className="flex-grow h-px bg-border"></div>
                </div>
                
                <button
                  type="button"
                  className="w-full p-4 bg-card border border-border text-foreground rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center space-x-2"
                  onClick={() => googleLoginMutation.mutate()}
                  disabled={googleLoginMutation.isPending || isCheckingRedirect}
                >
                  {(googleLoginMutation.isPending || isCheckingRedirect) ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      <path fill="none" d="M0 0h48v48H0z"/>
                    </svg>
                  )}
                  <span>{(googleLoginMutation.isPending || isCheckingRedirect) ? 'Connecting...' : 'Log in with Google'}</span>
                </button>
                
                <div className="text-center mt-6">
                  <p className="text-muted-foreground text-sm">
                    Don't have an account?{" "}
                    <button 
                      type="button"
                      onClick={() => setAuthMode('register')} 
                      className="text-primary hover:underline"
                    >
                      Create a new account
                    </button>
                  </p>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-primary">Create an account</h2>
              
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <div>
                  <input
                    id="register-username"
                    type="text"
                    placeholder="Username"
                    {...registerForm.register('username')}
                    className="w-full p-4 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-card"
                  />
                  {registerForm.formState.errors.username && (
                    <p className="text-destructive text-sm mt-1">
                      {registerForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <input
                    id="register-email"
                    type="email"
                    placeholder="Email address"
                    {...registerForm.register('email')}
                    className="w-full p-4 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-card"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-destructive text-sm mt-1">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <input
                    id="register-password"
                    type="password"
                    placeholder="Password"
                    {...registerForm.register('password')}
                    className="w-full p-4 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-card"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-destructive text-sm mt-1">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <input
                    id="register-confirm-password"
                    type="password"
                    placeholder="Confirm password"
                    {...registerForm.register('confirmPassword')}
                    className="w-full p-4 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-card"
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-destructive text-sm mt-1">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full p-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 text-lg font-medium"
                >
                  {registerMutation.isPending ? 'Creating account...' : 'Create account'}
                </button>
                
                <div className="flex items-center my-6">
                  <div className="flex-grow h-px bg-border"></div>
                  <div className="px-4 text-muted-foreground">or</div>
                  <div className="flex-grow h-px bg-border"></div>
                </div>
                
                <button
                  type="button"
                  className="w-full p-4 bg-card border border-border text-foreground rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center space-x-2"
                  onClick={() => googleLoginMutation.mutate()}
                  disabled={googleLoginMutation.isPending || isCheckingRedirect}
                >
                  {(googleLoginMutation.isPending || isCheckingRedirect) ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      <path fill="none" d="M0 0h48v48H0z"/>
                    </svg>
                  )}
                  <span>{(googleLoginMutation.isPending || isCheckingRedirect) ? 'Connecting...' : 'Sign up with Google'}</span>
                </button>
                
                <div className="text-center mt-6">
                  <p className="text-muted-foreground text-sm">
                    Already have an account?{" "}
                    <button 
                      type="button"
                      onClick={() => setAuthMode('login')} 
                      className="text-primary hover:underline"
                    >
                      Log in
                    </button>
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 p-8 items-center justify-center">
        <div className="max-w-lg text-center lg:text-left">
          <h2 className="text-4xl font-bold mb-6">Journey to self-discovery, one drop at a time</h2>
          <p className="text-lg mb-8">
            Drop is a daily journaling app that helps you reflect on your life through guided 
            questions and AI-powered conversations, bringing clarity and insights to your personal growth.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/80 p-4 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Daily Questions</h3>
              <p>Thoughtfully crafted prompts to inspire meaningful reflection</p>
            </div>
            
            <div className="bg-white/80 p-4 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">AI Conversations</h3>
              <p>Engage with Claude, your personal reflection companion</p>
            </div>
            
            <div className="bg-white/80 p-4 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Smart Tagging</h3>
              <p>Automatic organization of your entries by themes and topics</p>
            </div>
            
            <div className="bg-white/80 p-4 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Growth Insights</h3>
              <p>Track your personal development and emotional patterns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}