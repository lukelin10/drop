import React from 'react';
import { useAuth } from '../hooks/use-auth';
import { Link } from 'wouter';

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12">
        <nav className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">Drop</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/journal" className="text-foreground hover:text-primary">
              Journal
            </Link>
            <button
              onClick={() => logoutMutation.mutate()}
              className="px-4 py-2 text-sm bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md font-medium"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section className="mb-12">
          <div className="bg-card rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-4">Welcome back, {user?.username}!</h2>
            <p className="text-card-foreground mb-6">
              Start your daily reflection with a simple question. Each day brings new insights.
            </p>

            <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-medium mb-2">Today's Question</h3>
              <p className="text-lg mb-4">
                What is one small act of kindness you experienced or witnessed today?
              </p>
              <Link
                href="/journal"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                <span>Reflect & Write</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg shadow p-6">
            <div className="mb-4 p-2 bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                <path d="M8 12h8"></path>
                <path d="M12 8v8"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">New Entry</h3>
            <p className="text-muted-foreground mb-4">
              Begin a new journal entry with today's prompt.
            </p>
            <Link
              href="/journal"
              className="text-primary font-medium hover:underline inline-flex items-center"
            >
              Start writing
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1"
              >
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            </Link>
          </div>

          <div className="bg-card rounded-lg shadow p-6">
            <div className="mb-4 p-2 bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2"></path>
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M2 12h4"></path>
                <path d="M18 12h4"></path>
                <path d="M12 2v4"></path>
                <path d="M12 18v4"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Explore Insights</h3>
            <p className="text-muted-foreground mb-4">
              Browse your past entries and discover patterns.
            </p>
            <button className="text-primary font-medium hover:underline inline-flex items-center">
              View insights
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1"
              >
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            </button>
          </div>

          <div className="bg-card rounded-lg shadow p-6">
            <div className="mb-4 p-2 bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <path d="M12 17h.01"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Get Help</h3>
            <p className="text-muted-foreground mb-4">
              Learn how to make the most of your reflections.
            </p>
            <button className="text-primary font-medium hover:underline inline-flex items-center">
              View guide
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1"
              >
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}