import React, { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { Link } from 'wouter';

export default function JournalPage() {
  const { user } = useAuth();
  const [journalEntry, setJournalEntry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  
  // In a real app, you would fetch this from the API
  const todaysPrompt = {
    text: "What is one small act of kindness you experienced or witnessed today?",
    activeDate: new Date().toLocaleDateString()
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!journalEntry.trim()) return;
    
    setIsSubmitting(true);
    
    // In a real app, you would submit to the API
    setTimeout(() => {
      setIsSubmitting(false);
      setShowConversation(true);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12">
        <nav className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">Drop</h1>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground">
              {user?.username}
            </span>
          </div>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto">
        {!showConversation ? (
          <section>
            <div className="bg-card rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-2">Today's Reflection</h2>
              <p className="text-muted-foreground mb-6">
                {new Date().toLocaleDateString()} • Daily Prompt
              </p>

              <div className="bg-primary/5 border border-primary/20 p-5 rounded-lg mb-6">
                <h3 className="text-xl font-medium mb-2">Question:</h3>
                <p className="text-lg">{todaysPrompt.text}</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="journal-entry" className="block text-sm font-medium mb-2">
                    Your Thoughts
                  </label>
                  <textarea
                    id="journal-entry"
                    rows={8}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Start writing your reflection here..."
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !journalEntry.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save & Continue'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        ) : (
          <section>
            <div className="bg-card rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-semibold">Your Reflection</h2>
                  <p className="text-muted-foreground">
                    {new Date().toLocaleDateString()} • {todaysPrompt.text.substring(0, 30)}...
                  </p>
                </div>
                <button
                  onClick={() => setShowConversation(false)}
                  className="text-primary hover:underline text-sm"
                >
                  Edit entry
                </button>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg mb-6">
                <p className="whitespace-pre-wrap">{journalEntry}</p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-medium mb-4">Conversation with Claude</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex">
                    <div className="bg-primary/10 rounded-lg p-4 max-w-[80%]">
                      <p className="text-sm font-medium text-primary mb-1">Claude</p>
                      <p>
                        Thank you for sharing that reflection. I noticed you mentioned an experience with kindness. 
                        Would you like to explore how that made you feel in more depth?
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                      <p className="text-sm font-medium mb-1">You</p>
                      <p>Wait, this is just a demo. In the real app I would be able to chat with Claude about my journal entry.</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="bg-primary/10 rounded-lg p-4 max-w-[80%]">
                      <p className="text-sm font-medium text-primary mb-1">Claude</p>
                      <p>
                        You're absolutely right! In the full version of Drop, this would be a real conversation 
                        with Claude, Anthropic's AI assistant. You'd be able to dive deeper into your reflection, 
                        get personalized insights, and explore your thoughts through thoughtful dialogue.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 p-3 border rounded-l-md focus:ring-2 focus:ring-primary focus:border-primary"
                    disabled
                  />
                  <button
                    disabled
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-r-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}