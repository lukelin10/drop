import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useRoute, useLocation, Link } from 'wouter';

export default function ConversationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [matched, params] = useRoute('/conversation/:id');
  const entryId = matched ? parseInt(params.id) : null;
  
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEndChatModal, setShowEndChatModal] = useState(false);

  // Fetch the journal entry and conversation
  const { 
    data: entryData,
    isLoading: isLoadingEntry,
    error: entryError 
  } = useQuery({
    queryKey: ['/api/journal/entries', entryId],
    queryFn: async () => {
      if (!entryId) return null;
      const res = await apiRequest('GET', `/api/journal/entries/${entryId}`);
      return await res.json();
    },
    enabled: !!entryId
  });

  // Load or create conversation
  const {
    data: conversationData,
    isLoading: isLoadingConversation,
    error: conversationError,
    refetch: refetchConversation
  } = useQuery({
    queryKey: ['/api/journal/entries', entryId, 'conversations'],
    queryFn: async () => {
      if (!entryId) return null;
      
      try {
        // First try to get existing conversation
        const res = await apiRequest('GET', `/api/journal/entries/${entryId}/conversations`);
        return await res.json();
      } catch (error) {
        // If no conversation exists, create one
        const createRes = await apiRequest('POST', `/api/journal/entries/${entryId}/conversations`);
        return await createRes.json();
      }
    },
    enabled: !!entryId && !!entryData
  });

  // Send a new message
  const sendMessageMutation = useMutation({
    mutationFn: async (messageContent: string) => {
      const res = await apiRequest('POST', `/api/journal/entries/${entryId}/conversations/messages`, {
        content: messageContent
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setMessage('');
      setIsSubmitting(false);
      refetchConversation();
    },
    onError: (error: Error) => {
      toast({
        title: "Couldn't send message",
        description: error.message,
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    sendMessageMutation.mutate(message);
  };

  const handleEndChat = () => {
    setLocation('/journal');
  };

  // Check if the conversation has reached the message limit
  const hasReachedMessageLimit = conversationData?.messages && conversationData.messages.length >= 10;

  // Loading state
  if (isLoadingEntry || isLoadingConversation) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading your conversation...</p>
      </div>
    );
  }

  // Error state
  if (entryError || conversationError) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md max-w-md text-center">
          <h2 className="font-semibold mb-2">Something went wrong</h2>
          <p>{(entryError || conversationError)?.message || "Couldn't load the conversation."}</p>
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

  // For demo purposes, show placeholder conversation if data isn't available yet
  const entry = entryData || { 
    initialResponse: "This is where your journal entry would appear.", 
    entryDate: new Date().toISOString().split('T')[0] 
  };
  
  const messages = conversationData?.messages || [
    { 
      id: 1, 
      role: 'assistant', 
      content: "Thanks for sharing your thoughts. I'm Claude, your reflection coach. How would you like to explore this topic further?",
      sequenceOrder: 1
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-4 px-6 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Drop</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setShowEndChatModal(true)}
              className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-md"
            >
              End Chat
            </button>
            <span className="text-sm text-muted-foreground">{user?.username}</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-8 px-4 max-w-2xl flex flex-col">
        <div className="bg-card rounded-lg shadow-sm border p-6 mb-6">
          <p className="text-sm text-muted-foreground mb-1">
            {new Date(entry.entryDate).toLocaleDateString()} • Your Response
          </p>
          <div className="mt-3 p-4 bg-muted/30 rounded-md">
            <p className="whitespace-pre-wrap">{entry.initialResponse}</p>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Conversation with Claude</h2>
            <div className="text-xs text-muted-foreground">
              {hasReachedMessageLimit ? (
                <span className="text-amber-500">Message limit reached (10/10)</span>
              ) : (
                <span>Messages: {messages.length}/10</span>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                <div 
                  className={`max-w-[80%] rounded-lg p-4 ${
                    msg.role === 'assistant' 
                      ? 'bg-primary/10 text-foreground' 
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm font-medium mb-1">
                    {msg.role === 'assistant' ? 'Claude' : 'You'}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {hasReachedMessageLimit && (
              <div className="flex justify-center my-4">
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-md max-w-md text-center">
                  <p className="text-sm font-medium">
                    You've reached the message limit for this conversation. 
                  </p>
                  <button 
                    onClick={handleEndChat}
                    className="mt-2 text-primary text-sm font-medium hover:underline"
                  >
                    View your journal entries
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmitMessage} className="mt-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-3 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary"
                disabled={isSubmitting || hasReachedMessageLimit}
              />
              <button
                type="submit"
                disabled={isSubmitting || !message.trim() || hasReachedMessageLimit}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  "Send"
                )}
              </button>
            </div>
            {hasReachedMessageLimit && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                You've reached the limit of 10 messages for this conversation.
              </p>
            )}
          </form>
        </div>
      </main>

      {/* End chat confirmation modal */}
      {showEndChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">End this conversation?</h3>
            <p className="text-muted-foreground mb-4">
              You'll be redirected to your journal entries, where you can review past reflections.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEndChatModal(false)}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleEndChat}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                End Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}