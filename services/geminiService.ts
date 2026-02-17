
import { GoogleGenAI, Type } from "@google/genai";

export async function generateAffirmation(category: string, theme: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a powerful, high-vibe affirmation for the category "${category}" focusing on the theme "${theme}". 
    The affirmation should be in the present tense (e.g., "I am..." or "I have..."). 
    Keep it concise and elegant. Avoid clichés.`,
  });
  // Use .text property directly as it returns the string output.
  const text = response.text;
  return text ? text.trim() : "I am manifesting my highest potential.";
}

export async function suggestImageThemes(category: string): Promise<string[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest 5 specific, visually rich scenes or items for a vision board in the category: ${category}. 
    Focus on psychological 'Visual Anchoring' - things that represent the feeling of success rather than just the result.
    Example: instead of "money", suggest "a leather-bound planner on a solid oak desk".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  
  try {
    // Access .text property for the JSON response string.
    const text = response.text;
    return JSON.parse(text || "[]");
  } catch {
    return ["Dream scene 1", "Visual anchor 2", "Inspirational setting"];
  }
}
