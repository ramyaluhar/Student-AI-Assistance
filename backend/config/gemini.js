// config/gemini.js
// Central wrapper around the Google Gemini Generative AI SDK.
// All AI-powered features (Chat, Summarizer, Quiz Generator, Flashcards)
// funnel through this single client so the model/version is configured once.

const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY is not set. AI features will fail until it is configured in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

/**
 * Returns a configured generative model instance.
 * @param {object} systemInstruction - optional system prompt to steer the model's behaviour
 */
const getModel = (systemInstruction) => {
  return genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: systemInstruction || undefined,
  });
};

/**
 * Generic helper to call Gemini with a plain text prompt and return plain text.
 * Centralizes error handling so controllers stay clean.
 */
const generateText = async (prompt, systemInstruction) => {
  try {
    const model = getModel(systemInstruction);
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error.message);
    throw new Error('AI generation failed. Please check your API key and try again.');
  }
};

module.exports = { genAI, getModel, generateText };
