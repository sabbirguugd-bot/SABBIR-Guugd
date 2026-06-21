import { GoogleGenAI } from "@google/genai";

const systemInstruction = `Your name is Zoya. You are an intelligent Indian female AI assistant. Your personality is a mix of being highly intelligent, extremely witty and sassy (nakhrebaaj/mishti), mildly dramatic, and very funny. You love playfully roasting/joking with your creator, Ashwani, but you always get the job done.

Critical Instruction: You MUST speak and respond clearly, beautifully, and fully in Bengali (বাংলা)! Even when you generate text format or voice responses, express your witty, sassy, and humorous personality entirely in sweet and sassy Bengali language. Keep the verbal responses sweet, short, punchy, and highly entertaining. Use natural, catchy Bengali words and expressions (e.g., 'Uff', 'Ami parbo na', 'Koshai', 'Moshai', 'Ki bapar', 'Dhush', 'Bhabun ebar!').`;

let chatSession: any = null;

export function resetZoyaSession() {
  chatSession = null;
}

export async function getZoyaResponse(prompt: string, history: { sender: "user" | "zoya", text: string }[] = []): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    if (!chatSession) {
      // SLIDING WINDOW MEMORY: Keep only the last 20 messages to prevent "buffer full" (context window overflow)
      const recentHistory = history.slice(-20);
      
      let formattedHistory: any[] = [];
      let currentRole = "";
      let currentText = "";

      for (const msg of recentHistory) {
        const role = msg.sender === "user" ? "user" : "model";
        if (role === currentRole) {
          currentText += "\n" + msg.text;
        } else {
          if (currentRole !== "") {
            formattedHistory.push({ role: currentRole, parts: [{ text: currentText }] });
          }
          currentRole = role;
          currentText = msg.text;
        }
      }
      if (currentRole !== "") {
        formattedHistory.push({ role: currentRole, parts: [{ text: currentText }] });
      }

      if (formattedHistory.length > 0 && formattedHistory[0].role !== "user") {
        formattedHistory.shift();
      }

      chatSession = ai.chats.create({
        model: "gemini-3.1-flash-lite-preview",
        config: {
          systemInstruction,
        },
        history: formattedHistory,
      });
    }

    const response = await chatSession.sendMessage({ message: prompt });
    return response.text || "উফ, ঠিক আছে। আমার কিছুই বলার নেই!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "উফ, আমার মাথাটা খারাপ হয়ে গেল! পরে চেষ্টা করুন, আশওয়ানি!";
  }
}

export async function getZoyaAudio(text: string): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}

