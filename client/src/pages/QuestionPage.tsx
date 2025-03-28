import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useLocation } from 'wouter';

export default function QuestionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In a real implementation, this would come from the API
  const todaysQuestion = {
    id: 1,
    text: "What's something you're looking forward to?",
    activeDate: new Date().toISOString().split('T')[0]
  };

  // Submit the journal entry
  const submitMutation = useMutation({
    mutationFn: async (entryData: { 
      promptId: number; 
      initialResponse: string;
    }) => {
      const res = await apiRequest('POST', '/api/journal/entries', {
        ...entryData,
        entryDate: new Date().toISOString().split('T')[0]
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Entry saved",
        description: "Your journal entry has been saved successfully."
      });
      // Navigate to the conversation page with the entry ID
      setLocation(`/conversation/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Couldn't save entry",
        description: error.message,
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!answer.trim()) {
      toast({
        title: "Empty response",
        description: "Please write something before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    submitMutation.mutate({
      promptId: todaysQuestion.id,
      initialResponse: answer
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-4 px-6 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Drop</h1>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">{user?.username}</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-8 px-4 max-w-2xl">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-1">Today's Question • {new Date().toLocaleDateString()}</p>
          <h2 className="text-3xl font-semibold">{todaysQuestion.text}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <label htmlFor="answer" className="block text-sm font-medium text-muted-foreground mb-2">
              Your response
            </label>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Start typing your thoughts..."
              className="w-full min-h-[200px] p-3 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-y"
              disabled={isSubmitting}
            />
            
            <div className="flex justify-between items-center mt-4">
              <p className="text-xs text-muted-foreground">
                {answer.length === 0 ? (
                  "Take a moment to reflect and respond in your own way."
                ) : answer.length < 20 ? (
                  "Consider sharing more detail for a deeper reflection."
                ) : (
                  `${answer.split(' ').length} words`
                )}
              </p>
              <button
                type="submit"
                disabled={isSubmitting || !answer.trim()}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                    Submitting...
                  </span>
                ) : (
                  "Submit & Continue"
                )}
              </button>
            </div>
          </div>
          
          <div className="text-sm text-center text-muted-foreground">
            <p>
              Your response will be securely saved, and you'll be able to
              discuss it with Claude, our AI reflection coach.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}