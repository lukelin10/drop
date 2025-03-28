import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { Redirect } from 'wouter';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
  const { user, loginMutation, registerMutation } = useAuth();
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
      <div className="w-full lg:w-1/2 p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Drop</h1>
            <p className="text-muted-foreground">Your daily reflection journal</p>
          </div>
          
          <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="flex mb-6">
              <button
                className={`flex-1 py-2 text-center ${authMode === 'login' ? 'text-primary font-medium border-b-2 border-primary' : 'text-muted-foreground'}`}
                onClick={() => setAuthMode('login')}
              >
                Log In
              </button>
              <button
                className={`flex-1 py-2 text-center ${authMode === 'register' ? 'text-primary font-medium border-b-2 border-primary' : 'text-muted-foreground'}`}
                onClick={() => setAuthMode('register')}
              >
                Register
              </button>
            </div>
            
            {authMode === 'login' ? (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="login-username" className="block text-sm font-medium mb-1">
                      Username
                    </label>
                    <input
                      id="login-username"
                      type="text"
                      {...loginForm.register('username')}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-destructive text-sm mt-1">
                        {loginForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium mb-1">
                      Password
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      {...loginForm.register('password')}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-destructive text-sm mt-1">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loginMutation.isPending ? 'Logging in...' : 'Log In'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="register-username" className="block text-sm font-medium mb-1">
                      Username
                    </label>
                    <input
                      id="register-username"
                      type="text"
                      {...registerForm.register('username')}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-destructive text-sm mt-1">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="register-email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      id="register-email"
                      type="email"
                      {...registerForm.register('email')}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-destructive text-sm mt-1">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="register-password" className="block text-sm font-medium mb-1">
                      Password
                    </label>
                    <input
                      id="register-password"
                      type="password"
                      {...registerForm.register('password')}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-destructive text-sm mt-1">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="register-confirm-password" className="block text-sm font-medium mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="register-confirm-password"
                      type="password"
                      {...registerForm.register('confirmPassword')}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
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
                    className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                  >
                    {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="w-full lg:w-1/2 bg-primary/10 p-8 flex items-center justify-center">
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