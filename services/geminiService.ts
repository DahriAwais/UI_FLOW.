import { GoogleGenAI, Type } from "@google/genai";
import { Project, Screen, Message, DeviceType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helper: Generate Image ---
async function generateScreenImage(appContext: string, screenName: string, screenDescription: string, deviceType: DeviceType): Promise<string> {
  const fullPrompt = `
    High-Fidelity Mobile App UI Design for ${appContext}.
    Screen: ${screenName}
    Details: ${screenDescription}
    
    Specs:
    - Aspect Ratio: 9:16 (Vertical Mobile).
    - Style: Ultra-modern, Clean, Dribbble/Behance Top Trend, High Resolution.
    - View: Flat, straight-on front view ONLY. NO perspective, NO isometry, NO device frames, NO mockups.
    - Layout: Full screen edge-to-edge UI. 
    - IMPORTANT: Do not draw the device bezel, browser chrome, or notches. The image should be just the UI content rectangle.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: fullPrompt }] },
    config: {
      imageConfig: {
        aspectRatio: "9:16"
      }
    }
  });

  if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error(`Failed to generate image for ${screenName}`);
}

// --- Feature 1: Initial Generation ---
async function planAppFlow(prompt: string, deviceType: DeviceType): Promise<{ analysis: string; screens: { name: string; description: string }[] }> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a Lead Product Designer. Create a user flow for a mobile application: "${prompt}".
      1. Analyze the core value proposition.
      2. Define exactly 4 distinct high-fidelity screens for the MVP flow.
      
      Return JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            screens: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    },
                    required: ['name', 'description'],
                },
            }
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Failed to plan app flow");
    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error("Planning Error:", error);
    // Fallback
    return {
        analysis: "Generating standard app flow based on keywords.",
        screens: [
            { name: "Home", description: `Main dashboard for ${prompt} with key metrics and nav.` },
            { name: "List View", description: `Search results or item list for ${prompt}.` },
            { name: "Detail View", description: `Specific item details with actions for ${prompt}.` },
            { name: "Profile", description: `User settings and preferences for ${prompt}.` },
        ]
    };
  }
}

export const generateAppDesign = async (prompt: string, deviceType: DeviceType): Promise<Project> => {
  try {
    const planData = await planAppFlow(prompt, deviceType);
    
    // Generate screens in parallel
    const screenPromises = planData.screens.map(async (plan: any) => {
      const imageUrl = await generateScreenImage(prompt, plan.name, plan.description, deviceType);
      return {
        id: crypto.randomUUID(),
        name: plan.name,
        description: plan.description,
        imageUrl: imageUrl,
      } as Screen;
    });

    const screens = await Promise.all(screenPromises);

    const initialMessages: Message[] = [
        {
            id: crypto.randomUUID(),
            role: 'ai',
            type: 'analysis',
            content: planData.analysis || `Analyzed requirements for ${prompt}. Generating core flow.`,
            timestamp: Date.now()
        },
        {
            id: crypto.randomUUID(),
            role: 'ai',
            type: 'text',
            content: `I've designed the core flow for your mobile app **${prompt}**. The screens include ${screens.map(s => s.name).join(', ')}. What details should we refine?`,
            timestamp: Date.now()
        }
    ];

    return {
      id: crypto.randomUUID(),
      prompt,
      screens,
      messages: initialMessages,
      createdAt: Date.now(),
      deviceType: deviceType
    };

  } catch (error) {
    console.error("Gemini App Gen Error:", error);
    throw error;
  }
};

// --- Feature 2: Iteration/Chat ---
export const iterateAppDesign = async (currentProject: Project, userPrompt: string): Promise<{ newScreens: Screen[], messages: Message[] }> => {
    try {
        const existingScreensContext = currentProject.screens.map(s => s.name).join(', ');
        const deviceType = currentProject.deviceType || DeviceType.IOS;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Project: "${currentProject.prompt}" (${deviceType}).
            Current Screens: ${existingScreensContext}.
            User Request: "${userPrompt}".
            
            Task:
            1. Analyze request.
            2. Reply to user as a UI Designer.
            3. Identify if NEW screens are needed (only if explicitly asked or implied).
            
            Return JSON.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        analysis: { type: Type.STRING, description: "Design thinking process." },
                        reply: { type: Type.STRING, description: "Response to user." },
                        newScreensToGenerate: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                },
                                required: ['name', 'description'],
                            }
                        }
                    }
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("Failed to iterate design");
        const data = JSON.parse(text);

        const newMessages: Message[] = [
            {
                id: crypto.randomUUID(),
                role: 'ai',
                type: 'analysis',
                content: data.analysis,
                timestamp: Date.now()
            },
            {
                id: crypto.randomUUID(),
                role: 'ai',
                type: 'text',
                content: data.reply,
                timestamp: Date.now()
            }
        ];

        let newScreens: Screen[] = [];
        if (data.newScreensToGenerate && data.newScreensToGenerate.length > 0) {
            const screenPromises = data.newScreensToGenerate.map(async (plan: any) => {
                const imageUrl = await generateScreenImage(currentProject.prompt, plan.name, plan.description, deviceType);
                return {
                    id: crypto.randomUUID(),
                    name: plan.name,
                    description: plan.description,
                    imageUrl: imageUrl,
                } as Screen;
            });
            newScreens = await Promise.all(screenPromises);
        }

        return { newScreens, messages: newMessages };

    } catch (error) {
        console.error("Iteration Error:", error);
        throw error;
    }
}