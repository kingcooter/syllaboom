import OpenAI from 'openai';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL,
    'X-Title': 'Syllaboom',
  },
});

export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  model: string = 'meta-llama/llama-3.3-70b-instruct'
): Promise<string> {
  try {
    const response = await openrouter.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 16000,
      response_format: { type: 'json_object' },
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    // Log error safely without exposing potential auth details
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('LLM call failed, trying fallback model:', message);
    // Fallback to GPT-4o-mini
    const fallback = await openrouter.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 16000,
      response_format: { type: 'json_object' },
    });

    return fallback.choices[0]?.message?.content || '';
  }
}

export async function parseJSON<T>(jsonString: string): Promise<T> {
  try {
    // Clean potential markdown code blocks
    let cleaned = jsonString
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Try to repair truncated JSON by closing open brackets
    try {
      return JSON.parse(cleaned);
    } catch (firstError) {
      console.log('First parse failed, attempting repair...');

      // Count open brackets and close them
      const openBraces = (cleaned.match(/{/g) || []).length;
      const closeBraces = (cleaned.match(/}/g) || []).length;
      const openBrackets = (cleaned.match(/\[/g) || []).length;
      const closeBrackets = (cleaned.match(/\]/g) || []).length;

      // Remove trailing incomplete content after last complete value
      cleaned = cleaned.replace(/,\s*"[^"]*$/, '');
      cleaned = cleaned.replace(/,\s*$/, '');

      // Close any open strings
      const quoteCount = (cleaned.match(/"/g) || []).length;
      if (quoteCount % 2 !== 0) {
        cleaned += '"';
      }

      // Add missing closing brackets
      for (let i = 0; i < openBrackets - closeBrackets; i++) {
        cleaned += ']';
      }
      for (let i = 0; i < openBraces - closeBraces; i++) {
        cleaned += '}';
      }

      return JSON.parse(cleaned);
    }
  } catch (error) {
    console.error('JSON parse error:', error);
    console.error('Raw response (first 500 chars):', jsonString.substring(0, 500));
    throw new Error('Failed to parse LLM response as JSON');
  }
}
