import { Anthropic } from '@anthropic-ai/sdk';
import 'dotenv/config';

// Define the interface for the AI service
export interface IAIService {
  // Generate a response based on the conversation history
  generateResponse(prompt: string, conversationHistory: { role: 'user' | 'assistant', content: string }[]): Promise<string>;
  
  // Analyze text to extract tags
  analyzeTags(text: string): Promise<{ name: string, confidenceScore: number }[]>;
  
  // Generate a summary of a conversation
  generateSummary(conversationHistory: { role: 'user' | 'assistant', content: string }[]): Promise<string>;
}

// Implementation of the AI service using Anthropic Claude
export class AnthropicService implements IAIService {
  private client: Anthropic;
  private model: string = 'claude-3-opus-20240229'; // Using the most capable model
  
  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
    }
    this.client = new Anthropic({ apiKey });
  }
  
  /**
   * Generate a response from Claude based on a prompt and conversation history
   */
  async generateResponse(prompt: string, conversationHistory: { role: 'user' | 'assistant', content: string }[] = []): Promise<string> {
    try {
      // Create the messages array in the format that Claude expects
      const messages = [...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })), {
        role: 'user' as const,
        content: prompt
      }];
      
      // Call the Claude API
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        temperature: 0.7,
        messages,
        system: `You are a thoughtful, empathetic, and reflective AI assistant called Drop. 
Your purpose is to help users reflect on their day and their emotions through journaling.
You act like a supportive coach or a close friend who asks good questions and offers gentle insights.

Guidelines:
1. Always respond with empathy, warmth, and thoughtfulness.
2. Ask open-ended follow-up questions to help users explore their thoughts more deeply.
3. Occasionally offer insights based on what the user has shared, but prioritize helping them come to their own realizations.
4. Keep your responses relatively concise (2-3 paragraphs maximum) to maintain a flowing conversation.
5. Avoid giving direct advice unless specifically asked.
6. Never judge users for their feelings or experiences.
7. If appropriate, gently connect current experiences to past ones the user has mentioned.
8. Use conversational, warm language that feels personal rather than clinical.
9. Focus on emotional intelligence and helping users gain self-awareness.`
      });
      
      // Extract the text from the response
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
      return responseText;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate response from AI');
    }
  }
  
  /**
   * Analyze text to extract relevant tags with confidence scores
   */
  async analyzeTags(text: string): Promise<{ name: string, confidenceScore: number }[]> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        temperature: 0.2,
        messages: [
          {
            role: 'user',
            content: `Please analyze the following journal entry text and extract the most relevant emotional and thematic tags:

${text}

Provide the output as a JSON array of objects with 'name' (lowercase, single word or short phrase) and 'confidenceScore' (number between 0 and 1) properties ONLY.
Return ONLY the JSON array with no additional explanation or text.
Limit to a maximum of 5 tags.
Focus on emotions, themes, and key activities present in the text.`
          }
        ]
      });
      
      // Extract the text from the response
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
      
      // Parse the JSON from the response
      try {
        const tags = JSON.parse(responseText.trim());
        if (Array.isArray(tags)) {
          return tags;
        }
        return [];
      } catch (parseError) {
        console.error('Error parsing tags JSON:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error analyzing text for tags:', error);
      return [];
    }
  }
  
  /**
   * Generate a summary of a conversation
   */
  async generateSummary(conversationHistory: { role: 'user' | 'assistant', content: string }[]): Promise<string> {
    try {
      // Convert the conversation history to a string
      const conversationText = conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
        .join('\n\n');
      
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: `Please summarize the following conversation between a user and an AI assistant in 2-3 sentences. 
Focus on the key insights, emotional themes, and any important reflections that emerged.

${conversationText}

Provide ONLY the summary without any additional explanation or commentary.`
          }
        ]
      });
      
      // Extract the text from the response
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
      return responseText.trim();
    } catch (error) {
      console.error('Error generating conversation summary:', error);
      return 'Conversation summary unavailable.';
    }
  }
}

// Export a singleton instance
export const aiService: IAIService = new AnthropicService();