// "use server";
import { GoogleGenAI } from "@google/genai";
// 1. Retrieve the key from the now-loaded environment variable
const apiKey = process.env.GEMINI_API_KEY;

// Your manual check is now correct
if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey }); // Pass the key

const main = async (content: string) => {
  // ... your chat creation and message code ...
  const model = "gemini-2.5-flash";
  const chat = ai.chats.create({
    model: model,
  });

  let result = await chat.sendMessage({ message: content });
  return result.text;
};

export default main;
