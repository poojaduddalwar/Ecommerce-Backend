import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const generateProductDescription = async ({ name, category, color, compatibleWith }) => {
  const prompt = `Write a detailed and appealing product description for the following product:\n\n
  Name: ${name}\nCategory: ${category}\nColor: ${color}\nCompatible With: ${compatibleWith}\n\n
  Focus on benefits, features, and quality.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200
  });

  return response.choices[0].message.content.trim();
};
