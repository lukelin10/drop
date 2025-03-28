import Anthropic from '@anthropic-ai/sdk';

// Interface for our AI service
export interface IAIService {
  // Generate a response based on the conversation history
  generateResponse(prompt: string, conversationHistory: { role: 'user' | 'assistant', content: string }[]): Promise<string>;
  
  // Analyze text to extract tags
  analyzeTags(text: string): Promise<{ name: string, confidenceScore: number }[]>;
  
  // Generate a summary of a conversation
  generateSummary(conversationHistory: { role: 'user' | 'assistant', content: string }[]): Promise<string>;
}

// Implementation using Anthropic's Claude
export class AnthropicService implements IAIService {
  private client: Anthropic;
  private model: string = 'claude-3-7-sonnet-20250219'; // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
  
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
    
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('ANTHROPIC_API_KEY environment variable is not set. Claude functionality will not work.');
    }
  }
  
  /**
   * Generate a response from Claude based on a prompt and conversation history
   */
  async generateResponse(prompt: string, conversationHistory: { role: 'user' | 'assistant', content: string }[] = []): Promise<string> {
    try {
      let messages = [...conversationHistory];
      
      // If there's a prompt, add it to the messages
      if (prompt && prompt.trim().length > 0) {
        messages.push({
          role: 'user',
          content: prompt
        });
      }
      
      // If messages is empty, add a default user message
      if (messages.length === 0) {
        messages.push({
          role: 'user', 
          content: 'Hi, I\'d like to have a thoughtful conversation about my journal entry.'
        });
      }
      
      // Use system prompt to guide Claude's behavior
      const systemPrompt = 
        `You are a thoughtful journaling companion named Claude, part of the Drop journaling app.
         Your primary purpose is to help users reflect more deeply on their daily journal entries.
         
         Guidelines:
         - Be warm, empathetic, and thoughtful in your responses
         - Ask insightful follow-up questions that help users explore their thoughts and feelings
         - Provide perspective and gentle guidance, not directive advice
         - Keep responses concise (3-5 sentences maximum)
         - Never judge or criticize the user's feelings or experiences
         - Don't be overly cheerful or optimistic - match the user's emotional tone
         - If the user seems distressed, acknowledge their feelings and suggest they speak to a mental health professional if appropriate
         - Focus on helping the user gain personal insights rather than solving problems`;
      
      const response = await this.client.messages.create({
        model: this.model,
        system: systemPrompt,
        max_tokens: 1024,
        messages: messages,
      });
      
      return response.content[0].type === 'text' ? response.content[0].text : 'Sorry, I couldn\'t generate a response at this time.';
    } catch (error) {
      console.error('Error generating AI response:', error);
      return 'I apologize, but I\'m having trouble connecting to my systems right now. Could we try again in a moment?';
    }
  }
  
  /**
   * Analyze text to extract relevant tags with confidence scores
   */
  async analyzeTags(text: string): Promise<{ name: string, confidenceScore: number }[]> {
    try {
      const systemPrompt = 
        `You are an expert at analyzing journal entries and identifying key themes or topics.
         Extract 3-5 relevant tags from the user's journal entry, based on the emotional themes, 
         activities, people, places, or concepts mentioned.
         
         Guidelines:
         - Tags should be 1-2 words
         - Focus on emotional themes (e.g., "gratitude", "anxiety", "excitement")
         - Include activities, relationships, or concepts if prominently mentioned
         - Assign a confidence score (0.0-1.0) to each tag
         - Return ONLY a JSON array in this exact format:
           [
             { "name": "tag1", "confidenceScore": 0.95 },
             { "name": "tag2", "confidenceScore": 0.85 }
           ]
         - Do not include any explanations, headers, or additional text`;
      
      const response = await this.client.messages.create({
        model: this.model,
        system: systemPrompt,
        max_tokens: 1024,
        messages: [
          { role: 'user', content: text }
        ],
      });
      
      const content = response.content[0].type === 'text' ? response.content[0].text.trim() : '[]';
      
      // Extract the JSON array if it's wrapped in ```json or ``` markers
      let jsonContent = content;
      if (content.startsWith('```json')) {
        jsonContent = content.substring(7, content.length - 3).trim();
      } else if (content.startsWith('```') && content.endsWith('```')) {
        jsonContent = content.substring(3, content.length - 3).trim();
      }
      
      const tags = JSON.parse(jsonContent);
      
      // Validate and clean up the data
      return tags.map((tag: any) => ({
        name: tag.name.toLowerCase().trim(),
        confidenceScore: Math.min(1, Math.max(0, tag.confidenceScore))
      }));
    } catch (error) {
      console.error('Error analyzing tags:', error);
      // Return some default tags if there's an error
      return [
        { name: 'reflection', confidenceScore: 0.8 },
        { name: 'journaling', confidenceScore: 0.7 }
      ];
    }
  }
  
  /**
   * Generate a summary of a conversation
   */
  async generateSummary(conversationHistory: { role: 'user' | 'assistant', content: string }[]): Promise<string> {
    try {
      const systemPrompt = 
        `You are tasked with creating a brief, insightful summary of a journaling conversation.
         Based on the conversation history, create a 2-3 sentence summary that captures:
         - The main themes or topics discussed
         - Key insights or realizations the user had
         - The emotional tone of the conversation
         
         Keep the summary concise but meaningful, highlighting the most significant aspects of the reflection.`;
      
      // Convert conversation history to a single string for the prompt
      const conversationText = conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Claude'}: ${msg.content}`)
        .join('\n\n');
      
      const prompt = `Please summarize this journaling conversation:\n\n${conversationText}`;
      
      const response = await this.client.messages.create({
        model: this.model,
        system: systemPrompt,
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ],
      });
      
      return response.content[0].type === 'text' ? response.content[0].text : 'A thoughtful conversation exploring personal reflections and insights.';
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'A thoughtful conversation exploring personal reflections and insights.';
    }
  }
}

// Create and export a single instance of the AI service
export const aiService: IAIService = new AnthropicService();