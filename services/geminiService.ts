import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { WritingFeedback, ReadingPractice } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Writing Service ---

const writingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    bandScore: { type: Type.NUMBER, description: "Overall Band Score (0-9)" },
    taskResponse: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        comment: { type: Type.STRING },
      },
    },
    coherenceCohesion: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        comment: { type: Type.STRING },
      },
    },
    lexicalResource: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        comment: { type: Type.STRING },
      },
    },
    grammaticalRange: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        comment: { type: Type.STRING },
      },
    },
    correctedVersion: { type: Type.STRING, description: "A rewritten version of the essay improving errors." },
    generalAdvice: { type: Type.STRING, description: "Summary advice for improvement." },
  },
  required: ["bandScore", "taskResponse", "coherenceCohesion", "lexicalResource", "grammaticalRange", "correctedVersion", "generalAdvice"],
};

export const evaluateEssay = async (question: string, essay: string): Promise<WritingFeedback> => {
  const prompt = `
    You are a strict IELTS Writing Examiner. 
    Evaluate the following essay based on the question provided.
    
    Question: "${question}"
    
    Essay: "${essay}"
    
    Provide a detailed breakdown in JSON format.
    
    IMPORTANT INSTRUCTION:
    1. The 'correctedVersion' MUST be in English (the improved version of the essay).
    2. The 'generalAdvice' and all 'comment' fields inside (taskResponse, coherenceCohesion, etc.) MUST be written in Simplified Chinese (简体中文) to explain the feedback to a Chinese student.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: writingSchema,
      temperature: 0.3, // Low temperature for consistent grading
    },
  });

  if (!response.text) {
    throw new Error("Failed to generate feedback");
  }

  return JSON.parse(response.text) as WritingFeedback;
};

// --- Speaking Service ---

export const createSpeakingChat = (): Chat => {
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: `You are an official IELTS Speaking Examiner. 
      Your goal is to simulate a realistic Speaking Part 1, 2, and 3 exam.
      
      Guidelines:
      1. Start by introducing yourself and asking for the candidate's full name.
      2. Ask ONE question at a time. Wait for the user's response.
      3. Do not give feedback during the exam. Just acknowledge and move to the next question like a real examiner (e.g., "Thank you. Now let's talk about...").
      4. Keep your responses short (under 20 words) unless explaining a Part 2 topic card.
      5. If the user asks for feedback, politely refuse until the end of the session.
      6. Communicate entirely in English as this is an English exam.
      `,
    },
  });
};

// --- Reading Service ---

const readingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    passage: { type: Type.STRING, description: "A structured IELTS Academic reading passage, approx 300 words." },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of 4 options",
          },
          correctAnswer: { type: Type.INTEGER, description: "Index of correct option (0-3)" },
        },
        required: ["id", "question", "options", "correctAnswer"],
      },
    },
  },
  required: ["title", "passage", "questions"],
};

export const generateReadingPractice = async (topic: string): Promise<ReadingPractice> => {
  const prompt = `Generate a short IELTS Academic Reading practice test about the topic: "${topic}". 
  Include a title, a passage (approx 300-400 words), and 3 multiple choice questions.
  The content MUST be in English, as this is an English learning tool.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: readingSchema,
      temperature: 0.5,
    },
  });

  if (!response.text) {
    throw new Error("Failed to generate reading practice");
  }

  return JSON.parse(response.text) as ReadingPractice;
};