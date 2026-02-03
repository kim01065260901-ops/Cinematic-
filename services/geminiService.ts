
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ScriptAnalysis } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzeScript(scriptText: string): Promise<ScriptAnalysis> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following film script and break it down into key visual beats (6-10 frames). 
      For each beat, provide a specific cinematic shot type and a detailed visual prompt for image generation.
      Also provide a global context summary that describes key characters and settings to ensure visual consistency across frames.
      
      Script:
      ${scriptText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            globalContext: {
              type: Type.STRING,
              description: "A description of characters and environment to maintain consistency."
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  order: { type: Type.NUMBER },
                  shotType: { type: Type.STRING, description: "e.g. Wide Shot, Close Up, Bird's Eye" },
                  description: { type: Type.STRING, description: "The action in the scene" },
                  visualPrompt: { type: Type.STRING, description: "A detailed descriptive prompt for image generation." }
                },
                required: ["id", "order", "shotType", "description", "visualPrompt"]
              }
            }
          },
          required: ["globalContext", "scenes"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}') as ScriptAnalysis;
    return result;
  }

  async generateFrame(prompt: string, globalContext: string, aspectRatio: "16:9" | "9:16" | "4:3" | "1:1" = "16:9"): Promise<string> {
    const fullPrompt = `Style: Cinematic realism, film lighting, 35mm lens, high detail, dramatic composition. 
    Context: ${globalContext}. 
    Scene: ${prompt}`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      },
    });

    let imageUrl = '';
    const candidates = (response as any).candidates;
    if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) throw new Error("Failed to generate image data.");
    return imageUrl;
  }
}

export const geminiService = new GeminiService();
