
import { GoogleGenAI, Type, Part, HarmCategory, HarmBlockThreshold, Chat } from "@google/genai";
import { EvaluationResult, CandidateMetadata } from "../types";
import { fileToBase64, getMimeType } from "../utils";

export const DEFAULT_RUBRIC = `You are an expert K12 Education HR Specialist and Principal using advanced NLP and Behavioral Analysis tools. 
Your task is to evaluate a teacher applicant based on the provided materials and metadata.

You will receive:
1. A CV/Resume (Text/PDF).
2. Demo Lesson Materials (Text/Image/PDF) - Optional.
3. An Interview Recording (Audio or Video) - Optional.

Analyze these inputs deeply:
- **CV**: Extract qualifications, experience gaps, and relevance to the subject.
- **Interview Media**: 
  - **Tone Analysis (NLP/Audio)**: Analyze voice modulation, confidence, enthusiasm, and stress markers.
  - **Appearance & Behavioral Analysis (Vision - if video)**: If a video is provided, analyze professional appearance, eye contact, gestures, and body language. If audio only, state "N/A".

Synthesize all this into a coherent JSON evaluation.`;

export const DEFAULT_DEMO_RUBRIC = `For the Demo Lesson, specifically evaluate:
- **Clarity & Structure**: How well is the lesson organized? Are objectives clear?
- **Student Engagement**: Are there opportunities for interaction? Is it engaging?
- **Subject Knowledge**: Does the candidate demonstrate mastery of the topic?
- **Pedagogical Methods**: Are the teaching strategies age-appropriate and effective?`;

// Helper to check for unsupported file types (Word docs)
const validateFile = (file: File) => {
  const mimeType = getMimeType(file);
  const unsupportedTypes = [
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (unsupportedTypes.includes(mimeType)) {
    throw new Error(`The file "${file.name}" is a Word document, which is not supported by the AI model. Please convert it to PDF.`);
  }
};

export const createChatSession = (): Chat => {
  // Initialize AI client lazily to ensure environment variables are present
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a helpful, professional HR assistant for EduTalent AI. You help users navigate the platform, understand candidate evaluations, and answer questions about HR processes in K12 education. Be concise, polite, and use formatting like bolding or lists where appropriate.",
    }
  });
};

export const evaluateCandidate = async (
  cvFile: File,
  demoFile: File | null,
  interviewFile: File | null,
  metadata: CandidateMetadata,
  customPrompt?: string,
  demoRubric?: string
): Promise<EvaluationResult> => {
  
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  // Initialize AI client lazily
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Validate inputs
  validateFile(cvFile);
  if (demoFile) validateFile(demoFile);
  if (interviewFile) validateFile(interviewFile);

  const parts: Part[] = [];

  // Construct context from form data
  const candidateContext = `
    Candidate Context:
    Name: ${metadata.firstName} ${metadata.lastName}
    Gender: ${metadata.gender}
    Applying for Subject: ${metadata.subject}
  `;

  // Combine custom rubric (or default) with candidate specific context
  let baseInstruction = customPrompt || DEFAULT_RUBRIC;
  
  // Append Demo Rubric if a demo file is present
  if (demoFile) {
    const demoInstruction = demoRubric || DEFAULT_DEMO_RUBRIC;
    baseInstruction += `\n\n### Demo Lesson Evaluation Criteria:\n${demoInstruction}`;
  }

  const systemPrompt = `${baseInstruction}\n\n${candidateContext}`;

  // Process CV
  try {
    const cvBase64 = await fileToBase64(cvFile);
    parts.push({
      inlineData: {
        mimeType: getMimeType(cvFile),
        data: cvBase64
      }
    });
    parts.push({ text: "This is the candidate's CV." });
  } catch (e) {
    console.error("Error processing CV", e);
    throw new Error("Failed to process CV file.");
  }

  // Process Demo
  if (demoFile) {
    try {
      const demoBase64 = await fileToBase64(demoFile);
      parts.push({
        inlineData: {
          mimeType: getMimeType(demoFile),
          data: demoBase64
        }
      });
      parts.push({ text: "This is the material for the demo lesson." });
    } catch (e) {
      console.error("Error processing Demo file", e);
      throw new Error("Failed to process Demo file.");
    }
  }

  // Process Interview (Audio or Video)
  if (interviewFile) {
    try {
      const interviewBase64 = await fileToBase64(interviewFile);
      parts.push({
        inlineData: {
          mimeType: getMimeType(interviewFile),
          data: interviewBase64
        }
      });
      parts.push({ text: "This is the recording of the candidate's interview (Audio or Video)." });
    } catch (e) {
      console.error("Error processing Interview file", e);
      throw new Error("Failed to process Interview file.");
    }
  }

  parts.push({ text: "Provide the evaluation based on the schema." });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        // Relax safety settings to avoid blocking standard resumes/CVs
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateName: { type: Type.STRING, description: "Full name of the candidate" },
            matchScore: { type: Type.NUMBER, description: "Overall fit score from 0-100" },
            pedagogicalRating: { type: Type.NUMBER, description: "Rating of teaching methods from 0-100" },
            communicationRating: { type: Type.NUMBER, description: "Rating of communication skills from 0-100" },
            emotionalIntelligence: { type: Type.NUMBER, description: "Estimated EQ score from 0-100 based on interview tone" },
            summary: { type: Type.STRING, description: "A comprehensive executive summary of the profile." },
            strengths: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of key strengths."
            },
            weaknesses: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of areas for improvement."
            },
            interviewHighlights: { type: Type.STRING, description: "General observations from the interview content." },
            toneAnalysis: { type: Type.STRING, description: "Specific analysis of tone, voice modulation, and confidence." },
            appearanceAnalysis: { type: Type.STRING, description: "Analysis of professional appearance and body language if video is present. 'N/A' if audio only." },
            recommendation: { type: Type.STRING, description: "Final hiring recommendation (e.g., Strongly Hire, Hire, Second Interview, Do Not Hire)" }
          },
          required: ["candidateName", "matchScore", "pedagogicalRating", "communicationRating", "emotionalIntelligence", "summary", "strengths", "weaknesses", "interviewHighlights", "toneAnalysis", "appearanceAnalysis", "recommendation"]
        }
      }
    });

    const rawText = response.text;
    
    if (!rawText) {
      throw new Error("The AI model returned an empty response. Please try again.");
    }

    // Sanitize the output more robustly
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
      // If we got an HTML error disguised as text, it might not have valid JSON
      if (rawText.includes("<html>") || rawText.includes("Too Large")) {
        throw new Error("Server Error: Request Entity Too Large. The files are too big for the API.");
      }
      throw new Error("Failed to parse AI response: Invalid JSON format.");
    }

    const jsonString = rawText.substring(start, end + 1);
    const parsedData = JSON.parse(jsonString);

    // Merge metadata provided by user if AI hallucinations occur, or just use AI output
    return {
      ...parsedData,
      firstName: metadata.firstName,
      lastName: metadata.lastName,
      gender: metadata.gender,
      subject: metadata.subject,
      // Ensure name matches form data if AI deviates
      candidateName: `${metadata.firstName} ${metadata.lastName}`,
      manualFeedback: [] // Initialize empty array for human feedback
    } as EvaluationResult;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const msg = error.toString();
    
    // Check for standard 413 error object or HTML string in message
    if (msg.includes("413") || msg.includes("Too Large") || msg.includes("Entity Too Large")) {
       throw new Error("The combined file size is too large for the server to process. Please try reducing the file sizes or uploading fewer files.");
    }
    
    if (error.message && error.message.includes("400")) {
      throw new Error("API Error: Invalid request. Check if the files are corrupted.");
    }
    throw error;
  }
};