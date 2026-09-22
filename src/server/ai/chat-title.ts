import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function generateChatTitle(content: string) {
  const result = await generateText({
    model: google('gemini-3.5-flash-lite'),
    prompt: `
        Generate a short title for this chat based on the user's first message.

        Rules:
        - 2-6 words
        - concise
        - describe the user's intent
        - no quotes
        - no punctuation at the end

        User message:
        ${content}
    `,
  });

  return result.text.trim();
}
