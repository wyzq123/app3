
import { GoogleGenAI, Schema, Type } from "@google/genai";
import { WritingFeedback, ReadingPractice, UserSettings, AIProviderId, IChatSession, ChatMessage } from "../types";

// --- Configuration ---

export const PROVIDERS: Record<AIProviderId, { name: string; endpoint: string; models: string[] }> = {
  google: {
    name: "Google Gemini",
    endpoint: "", // Uses SDK
    models: ["gemini-2.5-flash", "gemini-3-pro-preview"]
  },
  openai: {
    name: "OpenAI (ChatGPT)",
    endpoint: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"]
  },
  deepseek: {
    name: "DeepSeek (深度求索)",
    endpoint: "https://api.deepseek.com", // Generic base
    models: ["deepseek-chat", "deepseek-reasoner"]
  },
  qwen: {
    name: "Alibaba Qwen (通义千问)",
    endpoint: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    models: ["qwen-plus", "qwen-turbo", "qwen-max"]
  },
  grok: {
    name: "xAI Grok",
    endpoint: "https://api.x.ai/v1",
    models: ["grok-2-latest"]
  },
  doubao: {
    name: "Doubao (豆包/火山引擎)",
    endpoint: "https://ark.cn-beijing.volces.com/api/v3", // Common endpoint, user often needs to adjust
    models: ["doubao-pro-32k"] // Model names vary by deployment, handled as input usually
  }
};

const DEFAULT_SETTINGS: UserSettings = {
  provider: 'google',
  apiKey: process.env.API_KEY || '',
  model: 'gemini-2.5-flash'
};

export const getSettings = (): UserSettings => {
  const saved = localStorage.getItem('ielts_ai_settings');
  if (saved) {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: UserSettings) => {
  localStorage.setItem('ielts_ai_settings', JSON.stringify(settings));
};

// --- Helper: Clean JSON ---
// Non-Gemini models might return Markdown code blocks even when asked for JSON.
const extractJson = (text: string): string => {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (match) return match[1];
  const matchSimple = text.match(/```\s*([\s\S]*?)\s*```/);
  if (matchSimple) return matchSimple[1];
  return text;
};

// --- Core API Abstraction ---

async function generateTextOpenAICompatible(
  settings: UserSettings, 
  messages: { role: string; content: string }[],
  jsonMode: boolean = false
): Promise<string> {
  const providerConfig = PROVIDERS[settings.provider];
  const endpoint = settings.customEndpoint || providerConfig.endpoint;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${settings.apiKey}`
  };

  const body: any = {
    model: settings.model,
    messages: messages,
    temperature: 0.7,
  };

  if (jsonMode) {
    // Some providers support response_format, others act better with just system prompt instructions
    // We strive for compatibility. DeepSeek and OpenAI support this.
    if (settings.provider === 'openai' || settings.provider === 'deepseek') {
      body.response_format = { type: "json_object" };
    }
  }

  try {
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API Request Failed: ${err}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("API Call Error:", error);
    throw error;
  }
}

// --- Writing Service ---

export const evaluateEssay = async (question: string, essay: string): Promise<WritingFeedback> => {
  const settings = getSettings();
  
  const systemPrompt = `
    You are a strict IELTS Writing Examiner. 
    Evaluate the essay based on the question.
    Provide output STRICTLY in valid JSON format.
    The 'correctedVersion' must be English.
    The 'generalAdvice' and all 'comments' must be in Simplified Chinese (简体中文).
    JSON Structure:
    {
      "bandScore": number,
      "taskResponse": { "score": number, "comment": "string" },
      "coherenceCohesion": { "score": number, "comment": "string" },
      "lexicalResource": { "score": number, "comment": "string" },
      "grammaticalRange": { "score": number, "comment": "string" },
      "correctedVersion": "string",
      "generalAdvice": "string"
    }
  `;

  const userPrompt = `Question: "${question}"\nEssay: "${essay}"`;

  // 1. Google Gemini Strategy
  if (settings.provider === 'google') {
    const ai = new GoogleGenAI({ apiKey: settings.apiKey });
    const writingSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        bandScore: { type: Type.NUMBER },
        taskResponse: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, comment: { type: Type.STRING } } },
        coherenceCohesion: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, comment: { type: Type.STRING } } },
        lexicalResource: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, comment: { type: Type.STRING } } },
        grammaticalRange: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, comment: { type: Type.STRING } } },
        correctedVersion: { type: Type.STRING },
        generalAdvice: { type: Type.STRING },
      },
      required: ["bandScore", "taskResponse", "coherenceCohesion", "lexicalResource", "grammaticalRange", "correctedVersion", "generalAdvice"],
    };

    const response = await ai.models.generateContent({
      model: settings.model,
      contents: systemPrompt + "\n" + userPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: writingSchema,
      },
    });
    return JSON.parse(response.text!) as WritingFeedback;
  }

  // 2. OpenAI Compatible Strategy
  const content = await generateTextOpenAICompatible(
    settings, 
    [
      { role: "system", content: systemPrompt }, 
      { role: "user", content: userPrompt }
    ], 
    true
  );
  
  return JSON.parse(extractJson(content));
};

// --- Reading Service ---

export const generateReadingPractice = async (topic: string): Promise<ReadingPractice> => {
  const settings = getSettings();

  const systemPrompt = `
    Generate a short IELTS Academic Reading practice test about: "${topic}".
    Content must be English.
    Output STRICTLY valid JSON.
    Structure:
    {
      "title": "string",
      "passage": "string (approx 300 words)",
      "questions": [
        { "id": number, "question": "string", "options": ["string", "string", "string", "string"], "correctAnswer": number (0-3) }
      ]
    }
  `;

  // 1. Google Gemini Strategy
  if (settings.provider === 'google') {
    const ai = new GoogleGenAI({ apiKey: settings.apiKey });
    const readingSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        passage: { type: Type.STRING },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
            },
            required: ["id", "question", "options", "correctAnswer"],
          },
        },
      },
      required: ["title", "passage", "questions"],
    };

    const response = await ai.models.generateContent({
      model: settings.model,
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: readingSchema,
      },
    });
    return JSON.parse(response.text!) as ReadingPractice;
  }

  // 2. OpenAI Compatible Strategy
  const content = await generateTextOpenAICompatible(
    settings, 
    [{ role: "user", content: systemPrompt }], // Some models behave better if instructions are in user prompt for creative tasks
    true
  );
  
  return JSON.parse(extractJson(content));
};

// --- Speaking Service ---

class GeminiSession implements IChatSession {
  private chat: any;

  constructor(apiKey: string, model: string, systemInstruction: string) {
    const ai = new GoogleGenAI({ apiKey });
    this.chat = ai.chats.create({
      model: model,
      config: { systemInstruction },
    });
  }

  async sendMessage(text: string): Promise<string> {
    const result = await this.chat.sendMessage({ message: text });
    return result.text || "";
  }
}

class OpenAISession implements IChatSession {
  private settings: UserSettings;
  private history: { role: string; content: string }[];
  private systemInstruction: string;

  constructor(settings: UserSettings, systemInstruction: string) {
    this.settings = settings;
    this.systemInstruction = systemInstruction;
    this.history = [{ role: "system", content: systemInstruction }];
  }

  async sendMessage(text: string): Promise<string> {
    this.history.push({ role: "user", content: text });
    
    // We don't use jsonMode here, just text
    const responseText = await generateTextOpenAICompatible(this.settings, this.history, false);
    
    this.history.push({ role: "assistant", content: responseText });
    return responseText;
  }
}

export const createSpeakingSession = async (): Promise<IChatSession> => {
  const settings = getSettings();
  const systemInstruction = `
    You are an official IELTS Speaking Examiner. 
    Simulate a realistic Speaking Part 1, 2, and 3 exam.
    1. Introduce yourself, ask for name.
    2. Ask ONE question at a time.
    3. Do NOT give feedback.
    4. Keep responses short (under 30 words) usually.
    5. Speak ONLY English.
  `;

  if (settings.provider === 'google') {
    return new GeminiSession(settings.apiKey, settings.model, systemInstruction);
  } else {
    // For OpenAI/DeepSeek etc, we need to initialize the session
    const session = new OpenAISession(settings, systemInstruction);
    // Note: In the React component, we usually send an initial "Hello" to trigger the start, 
    // or let the user click start. The component logic handles the first interaction.
    return session;
  }
};
