import React from 'react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          We couldn't find the page you're looking for. It might have been removed, renamed,
          or didn't exist in the first place.
        </p>
        <Link href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Go back home
        </Link>
      </div>
    </div>
  );
}