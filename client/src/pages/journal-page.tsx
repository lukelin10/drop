import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { formatDistanceToNow } from 'date-fns';

type JournalEntry = {
  id: number;
  userId: number;
  promptId: number;
  entryDate: string;
  initialResponse: string;
  moodScore: number | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export default function JournalPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Fetch all journal entries
  const { 
    data: entries, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/journal/entries'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/journal/entries');
      return await res.json() as JournalEntry[];
    }
  });

  // Navigate to the conversation for a specific entry
  const viewConversation = (entryId: number) => {
    setLocation(`/conversation/${entryId}`);
  };

  // Navigate to create a new entry
  const createNewEntry = () => {
    setLocation('/daily-question');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading your journal entries...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md max-w-md text-center">
          <h2 className="font-semibold mb-2">Something went wrong</h2>
          <p>{(error as Error).message || "Couldn't load your journal entries."}</p>
          <button 
            onClick={() => setLocation('/')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-4 px-6 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary cursor-pointer">Drop</h1>
          </Link>
          <div className="flex gap-4 items-center">
            <button
              onClick={createNewEntry}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
            >
              New Entry
            </button>
            <span className="text-sm text-muted-foreground">{user?.username}</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Your Journal Entries</h2>
          
          {entries && entries.length > 0 ? (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="bg-card rounded-lg shadow-sm border p-6 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => viewConversation(entry.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-lg">{new Date(entry.entryDate).toLocaleDateString()}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {entry.isFavorite && (
                      <span className="text-amber-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-muted/30 rounded-md p-3 mb-3">
                    <p className="line-clamp-3 text-muted-foreground">{entry.initialResponse}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {entry.moodScore ? `Mood score: ${entry.moodScore}/10` : ''}
                    </span>
                    <button 
                      className="text-primary text-sm font-medium hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        viewConversation(entry.id);
                      }}
                    >
                      View conversation →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-muted/20 border border-dashed rounded-lg p-8 text-center">
              <h3 className="text-xl font-medium mb-3">No entries yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your journaling journey by creating your first entry.
              </p>
              <button
                onClick={createNewEntry}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Answer today's question
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}