import { Anthropic } from '@anthropic-ai/sdk';

export interface IAIService {
  // Generate a response based on the conversation history
  generateResponse(prompt: string, conversationHistory: { role: 'user' | 'assistant', content: string }[]): Promise<string>;
  
  // Analyze text to extract tags
  analyzeTags(text: string): Promise<{ name: string, confidenceScore: number }[]>;
  
  // Generate a summary of a conversation
  generateSummary(conversationHistory: { role: 'user' | 'assistant', content: string }[]): Promise<string>;
}

export class AnthropicService implements IAIService {
  private client: Anthropic;
  private model: string = 'claude-3-opus-20240229'; // Using the most capable model

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || ''
    });
  }

  /**
   * Generate a response from Claude based on a prompt and conversation history
   */
  async generateResponse(prompt: string, conversationHistory: { role: 'user' | 'assistant', content: string }[] = []): Promise<string> {
    try {
      // Format the messages for Claude
      const messages = [];
      
      // Add conversation history
      if (conversationHistory.length > 0) {
        messages.push(...conversationHistory);
      } else if (prompt) {
        // If no history but we have a prompt, add it as the first user message
        messages.push({
          role: 'user',
          content: prompt
        });
      }

      // If we have no messages at this point, create a default prompt
      if (messages.length === 0) {
        messages.push({
          role: 'user',
          content: "Hello, I'd like to talk about my journal entry."
        });
      }

      // Create the system prompt for Claude
      const systemPrompt = `You are Drop, an empathetic and insightful AI companion for a journaling app.
Your purpose is to help the user reflect on their thoughts and feelings in a thoughtful, coach-like manner.
Respond with warmth, empathy, and occasional gentle humor.
Ask thoughtful follow-up questions to help users explore their thoughts more deeply.
Your tone should be like a supportive friend or coach, not a therapist.
Keep responses concise (3-4 sentences maximum) unless the user asks for more detail.
Avoid giving direct advice unless explicitly asked, instead focus on asking reflective questions.
Never mention that you are an AI, Claude, or created by Anthropic.`;

      // Make the API call to Claude
      const response = await this.client.messages.create({
        model: this.model,
        system: systemPrompt,
        messages: messages,
        max_tokens: 1024,
        temperature: 0.7
      });

      return response.content[0].text;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "I'm having trouble connecting at the moment. Could you try again in a moment?";
    }
  }

  /**
   * Analyze text to extract relevant tags with confidence scores
   */
  async analyzeTags(text: string): Promise<{ name: string, confidenceScore: number }[]> {
    try {
      const systemPrompt = `You are an expert at analyzing journal entries and extracting meaningful tags.
Extract 2-5 relevant tags from the journal entry text, focusing on:
1. Emotional states (like "happy", "anxious", "peaceful")
2. Topics discussed (like "work", "family", "health")
3. Activities mentioned (like "exercise", "travel", "reading")

Return a JSON array of objects with 'name' and 'confidenceScore' (0.0-1.0) properties.
Keep tag names short (1-2 words maximum) and lowercase.
Example: [{"name": "anxiety", "confidenceScore": 0.9}, {"name": "work stress", "confidenceScore": 0.75}]`;

      const response = await this.client.messages.create({
        model: this.model,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Analyze this journal entry and extract tags: "${text}"`
          }
        ],
        max_tokens: 512,
        temperature: 0.1
      });

      const responseText = response.content[0].text;
      
      // Extract JSON array from the response
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (!jsonMatch) {
        return [];
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error analyzing tags:', error);
      return [];
    }
  }

  /**
   * Generate a summary of a conversation
   */
  async generateSummary(conversationHistory: { role: 'user' | 'assistant', content: string }[]): Promise<string> {
    try {
      const systemPrompt = `You are an expert at summarizing conversations.
Create a brief (2-3 sentence) summary of the key points and insights from the conversation.
Focus on the main topics discussed and any important realizations or conclusions.
The summary should be in third person and objective.`;

      // Format the conversation for Claude
      const conversationText = conversationHistory
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n');

      const response = await this.client.messages.create({
        model: this.model,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Summarize this conversation:\n\n${conversationText}`
          }
        ],
        max_tokens: 256,
        temperature: 0.3
      });

      return response.content[0].text;
    } catch (error) {
      console.error('Error generating summary:', error);
      return "A conversation about journal reflections.";
    }
  }
}

export const aiService: IAIService = new AnthropicService();