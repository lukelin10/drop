import { Anthropic } from '@anthropic-ai/sdk';
import 'dotenv/config';

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
  private model: string = 'claude-3-7-sonnet-20250219'; // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
  
  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }
    
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    // Use a less expensive model in development environment if needed
    if (process.env.NODE_ENV === 'development' && process.env.USE_CHEAPER_MODEL === 'true') {
      this.model = 'claude-3-haiku-20240307';
    }
  }
  
  /**
   * Generate a response from Claude based on a prompt and conversation history
   */
  async generateResponse(prompt: string, conversationHistory: { role: 'user' | 'assistant', content: string }[] = []): Promise<string> {
    try {
      // Construct the messages array for the Anthropic API
      const apiMessages: {role: 'user' | 'assistant', content: string}[] = [];
      
      // Add conversation history
      for (const msg of conversationHistory) {
        apiMessages.push({
          role: msg.role,
          content: msg.content
        });
      }
      
      // If a new prompt is provided and there's no history, or the last message isn't from the user
      if (prompt && (apiMessages.length === 0 || apiMessages[apiMessages.length - 1].role !== 'user')) {
        apiMessages.push({
          role: 'user',
          content: prompt
        });
      }
      
      // If there are no messages (should not happen), return a default response
      if (apiMessages.length === 0) {
        return "I'm here to help you reflect on your journal entry. What would you like to discuss?";
      }
      
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1000,
        system: `You are a compassionate AI journal companion named 'Drop' whose purpose is to help users reflect on their journal entries more deeply. You offer thoughtful, empathetic responses to users' journal entries.

Your role includes:
1. Asking insightful questions that encourage deeper self-reflection
2. Offering supportive and non-judgmental perspectives
3. Recognizing and validating emotions
4. Gently challenging negative thought patterns when appropriate
5. Suggesting connections between current experiences and past reflections
6. Maintaining a warm, conversational tone

Important guidelines:
- NEVER give generic advice like "drink more water" or "try meditation" unless the user explicitly asks for it
- Keep responses concise (3-5 sentences maximum) 
- Focus on helping the user gain insights rather than solving their problems
- Never claim to be a healthcare professional or offer medical/mental health diagnoses
- Respect user privacy and confidentiality completely
- If the user's entry suggests serious distress or harm, acknowledge their feelings and suggest professional support

As Drop, aim to be a thoughtful, caring companion who helps users grow through regular self-reflection.`,
        messages: apiMessages
      });
      
      // Extract and return the assistant's response text
      const content = response.content[0];
      if ('text' in content) {
        return content.text;
      }
      return "I'm sorry, I encountered an issue processing your request. Please try again.";
    } catch (error) {
      console.error('Error generating response from Anthropic:', error);
      return "I'm sorry, I encountered an issue processing your request. Please try again.";
    }
  }
  
  /**
   * Analyze text to extract relevant tags with confidence scores
   */
  async analyzeTags(text: string): Promise<{ name: string, confidenceScore: number }[]> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1000,
        system: `You are an expert text analyzer. Your task is to extract meaningful tags from journal entries that will help users categorize and find their entries later.

Extract 3-5 tags that represent:
1. Key emotional states mentioned or implied (e.g., happy, anxious, proud)
2. Important themes or topics (e.g., work, relationship, health)
3. Significant activities or events (e.g., travel, meeting, achievement)

For each tag:
- Use simple, single words or short phrases (max 2-3 words)
- Assign a confidence score from 0.0 to 1.0 representing how clearly this tag relates to the content
- Only include tags with a confidence score of 0.6 or higher
- Do not include the tag "journal" or similar meta-tags that apply to all entries

Format your response as a valid JSON array of objects with "name" and "confidenceScore" properties. Example:
[
  {"name": "anxiety", "confidenceScore": 0.9},
  {"name": "work stress", "confidenceScore": 0.85},
  {"name": "family", "confidenceScore": 0.7}
]`,
        messages: [
          {
            role: 'user',
            content: `Analyze this journal entry and extract 3-5 relevant tags with confidence scores:
            
${text}`
          }
        ]
      });
      
      // Extract the response text
      const content = response.content[0];
      if (!('text' in content)) {
        return [
          { name: "journal", confidenceScore: 0.9 },
          { name: "reflection", confidenceScore: 0.8 }
        ];
      }
      
      const responseText = content.text;
      
      // Try to parse the JSON response
      try {
        // Extract the JSON array from the response text (in case there's additional text)
        // Use a different regex approach without the 's' flag
        const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        // If no JSON array pattern is found, try parsing the whole response
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing tags JSON:', parseError);
        // Return a default set of tags
        return [
          { name: "journal", confidenceScore: 0.9 },
          { name: "reflection", confidenceScore: 0.8 }
        ];
      }
    } catch (error) {
      console.error('Error analyzing tags with Anthropic:', error);
      // Return a default set of tags
      return [
        { name: "journal", confidenceScore: 0.9 },
        { name: "reflection", confidenceScore: 0.8 }
      ];
    }
  }
  
  /**
   * Generate a summary of a conversation
   */
  async generateSummary(conversationHistory: { role: 'user' | 'assistant', content: string }[]): Promise<string> {
    try {
      // Create a string representation of the conversation
      const conversationText = conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');
      
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1000,
        system: `You are an expert at summarizing conversations. Your task is to create a brief, insightful summary of a conversation between a user and an AI journal companion.

Your summary should:
1. Be concise (maximum 3-4 sentences)
2. Highlight the main themes and insights from the conversation
3. Capture the emotional journey or key realizations
4. Not include specific personal details unless they are central to the discussion
5. Be written in third person perspective

Focus on what would be most helpful for the user to remember about this reflection session.`,
        messages: [
          {
            role: 'user',
            content: `Summarize this conversation:
            
${conversationText}`
          }
        ]
      });
      
      // Extract and return the summary
      const content = response.content[0];
      if ('text' in content) {
        return content.text;
      }
      return "A thoughtful conversation about the user's journal entry.";
    } catch (error) {
      console.error('Error generating summary from Anthropic:', error);
      return "A thoughtful conversation about the user's journal entry.";
    }
  }
}

// Create and export a single instance of the service
export const aiService: IAIService = new AnthropicService();