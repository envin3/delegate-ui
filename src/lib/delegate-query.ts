import { OpenAI } from 'openai'

export async function parseQuery(directive: string, proposal: string): Promise<string> {
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    })
  
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
        { role: 'system', content: directive },
        { role: 'user', content: proposal },
        ],
      })
  
      return response.choices[0].message.content || ''
    } catch (error: any) {
      console.error('Error:', error)
      return ''
    }
  }