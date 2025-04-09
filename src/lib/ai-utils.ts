export async function fetchOpenAIResponse(directive: string, proposal: string): Promise<string> {
  const OpenAI = (await import('openai')).OpenAI;
  
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  try {
    console.log('Fetching OpenAI directly');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: directive },
        { role: 'user', content: proposal },
      ],
    });
    
    return response.choices[0].message.content || '';
  } catch (error: any) {
    console.error('Error:', error);
    throw error; // Propagate error for React Query to handle
  }
}