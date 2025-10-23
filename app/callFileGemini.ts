// @/app/callGemini.ts

// "use server";

import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";

// ⭐️ REMOVE: import { Buffer } from 'buffer';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey });

// The 'file' argument here is the File/Blob passed from the client
export async function callFileGemini(prompt: string, file: any) {
  if (!file) {
    // Handle case where no file is uploaded
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  }

  try {
    // ⭐️ FIX: Pass the Blob/File directly to the upload method.
    // The @google/genai library is designed to handle this in a server environment.
    const uploadedFile: any = await ai.files.upload({
      file: file, // Pass the Blob/File object directly
      config: {
        mimeType: file.type,
        // The 'file' variable is typed as Blob, so we assert it as File
        // to safely access the optional 'name' property.
        displayName: (file as File).name || "uploaded_file",
      },
    });

    // 2. Generate content with the file reference
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: createUserContent([
        createPartFromUri(uploadedFile.uri, uploadedFile.mimeType),
        prompt,
      ]),
    });

    // 3. Clean up the uploaded file
    await ai.files.delete({ name: uploadedFile.name });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Ensure you throw a standard Error object
    throw new Error("Failed to process file with Gemini API.");
  }
}
// import {
//   GoogleGenAI,
//   createUserContent,
//   createPartFromUri,
// } from "@google/genai";

// const apiKey = process.env.GEMINI_API_KEY;

// // Your manual check is now correct
// if (!apiKey) {
//   throw new Error("GEMINI_API_KEY environment variable is not set.");
// }

// const ai = new GoogleGenAI({ apiKey }); // Pass the key

// async function callFileGemini(files: any) {
//   console.log(files);
//   const myfile: any = await ai.files.upload({
//     file: files[0].url,
//     config: { mimeType: files[0].type },
//   });
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: createUserContent([
//       createPartFromUri(myfile.uri, myfile.mimeType),
//       "Describe this audio clip",
//     ]),
//   });
//   console.log(response.text);
// }

// export default callFileGemini;
