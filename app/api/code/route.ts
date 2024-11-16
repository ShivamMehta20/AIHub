import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {  checkApiLimit,increaseApiLimit} from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
interface Part {
  text: string;
}

interface Content {
  role: string;
  parts: Part[];
}

interface GeminiContent {
  role: "user" | "model";
  parts: { text: string }[];
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    let body: { messages: Content[]; language?: string };
    
    try {
      body = await req.json();
    } catch (e) {
      console.log(e);
      
      return new NextResponse("Invalid JSON in request body", { status: 400 });
    }

    const { messages, language = "javascript" } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!messages || !Array.isArray(messages)) {
      return new NextResponse("Messages are required and must be an array", {
        status: 400,
      });
    }
    const freeTrial = await checkApiLimit();
    const isPro = checkSubscription()
    if (!freeTrial && !isPro) {
      return new NextResponse("Free Trial Expired.",{status:403})
    }
    // Convert messages to Gemini's format
    const history: GeminiContent[] = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.parts[0].text }]
    }));

    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
      ],
    });

    // Enhance the prompt for code generation
    const lastMessage = messages[messages.length - 1];
    const enhancedPrompt = `Generate code in ${language}. Please provide clean, well-documented code with comments explaining key parts. Here's the request: ${lastMessage.parts[0].text}`;

    const result = await chat.sendMessage(enhancedPrompt);
    const responseText = await result.response.text();

    // Extract code blocks using a more compatible approach
    let cleanedResponse = responseText;
    const codePattern = /```(?:\w+)?\n([\s\S]*?)```/g;
    const codeBlocks: string[] = [];
    let match: RegExpExecArray | null;
    
    while ((match = codePattern.exec(responseText)) !== null) {
      if (match[1]) {
        codeBlocks.push(match[1].trim());
      }
    }

    if (codeBlocks.length > 0) {
      cleanedResponse = codeBlocks.join('\n\n');
    }

    // Format the response
    const response = {
      role: "model",
      parts: [{ text: cleanedResponse }],
      messages: [
        ...messages,
        {
          role: "model",
          parts: [{ text: cleanedResponse }]
        }
      ]
    };
    if (!isPro) {
      await increaseApiLimit();
    }
    return NextResponse.json(response);
  } catch (error) {
    console.log("[CODE_GENERATION_ERROR]", error);
    if (error instanceof Error) {
      return new NextResponse(`Error generating code: ${error.message}`, { status: 500 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}