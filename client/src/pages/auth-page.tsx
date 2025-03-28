import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/use-auth';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '../hooks/use-toast';
import { useLocation } from 'wouter';

// Form schemas
const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = loginSchema.extend({
  email: z.string().email('Please enter a valid email address'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoginView, setIsLoginView] = React.useState(true);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      setLocation('/');
    }
  }, [user, setLocation]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Form column */}
      <div className="w-full md:w-1/2 flex flex-col p-8">
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            {isLoginView ? 'Welcome back!' : 'Create your account'}
          </h1>

          {/* Tab selector */}
          <div className="flex mb-8 border-b">
            <button
              className={`pb-2 px-4 font-medium ${isLoginView ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
              onClick={() => setIsLoginView(true)}
            >
              Login
            </button>
            <button
              className={`pb-2 px-4 font-medium ${!isLoginView ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
              onClick={() => setIsLoginView(false)}
            >
              Register
            </button>
          </div>

          {isLoginView ? (
            /* Login Form */
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="login-username" className="text-sm font-medium">
                  Username
                </label>
                <input
                  id="login-username"
                  type="text"
                  {...loginForm.register('username')}
                  className="w-full px-3 py-2 rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {loginForm.formState.errors.username?.message && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="login-password" className="text-sm font-medium">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  {...loginForm.register('password')}
                  className="w-full px-3 py-2 rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {loginForm.formState.errors.password?.message && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-md shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="register-username" className="text-sm font-medium">
                  Username
                </label>
                <input
                  id="register-username"
                  type="text"
                  {...registerForm.register('username')}
                  className="w-full px-3 py-2 rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {registerForm.formState.errors.username?.message && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="register-email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  {...registerForm.register('email')}
                  className="w-full px-3 py-2 rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {registerForm.formState.errors.email?.message && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="register-password" className="text-sm font-medium">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  {...registerForm.register('password')}
                  className="w-full px-3 py-2 rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {registerForm.formState.errors.password?.message && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="register-confirm-password" className="text-sm font-medium">
                  Confirm Password
                </label>
                <input
                  id="register-confirm-password"
                  type="password"
                  {...registerForm.register('confirmPassword')}
                  className="w-full px-3 py-2 rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {registerForm.formState.errors.confirmPassword?.message && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-md shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Hero column */}
      <div className="hidden md:block md:w-1/2 bg-primary p-12 flex flex-col justify-center">
        <div className="text-primary-foreground max-w-lg">
          <h2 className="text-4xl font-bold mb-4">Reflect. Connect. Grow.</h2>
          <p className="text-xl mb-6">
            Drop is your daily companion for mindful journaling and self-reflection.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center">
              <div className="rounded-full bg-primary-foreground/20 p-1 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                  <path d="M12 2v6"></path>
                  <path d="M11.245 18.408C7.679 17.492 5 14.408 5 11V5h14v6c0 3.866-3.276 7.212-7.245 7.408" />
                  <path d="M6.5 13c2.35 3.5 8.65 3.5 11 0" />
                </svg>
              </div>
              One thoughtful question daily to inspire reflection
            </li>
            <li className="flex items-center">
              <div className="rounded-full bg-primary-foreground/20 p-1 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                </svg>
              </div>
              AI-powered insights to deepen your self-awareness
            </li>
            <li className="flex items-center">
              <div className="rounded-full bg-primary-foreground/20 p-1 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"></path>
                  <path d="M12 8v4l2 2"></path>
                </svg>
              </div>
              Track patterns and growth over time with smart tagging
            </li>
            <li className="flex items-center">
              <div className="rounded-full bg-primary-foreground/20 p-1 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              Private and secure - your thoughts remain yours
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}