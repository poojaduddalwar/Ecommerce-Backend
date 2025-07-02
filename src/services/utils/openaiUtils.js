import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load the .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Throw if missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error('❌ OPENAI_API_KEY is missing or empty in the .env file');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

export default openai;
