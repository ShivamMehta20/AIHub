import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

interface Part {
  text: string;
}

// Define types for the chat content
interface Content {
  role: string;
  parts: Part[];
}
interface GeminiContent {
  role: "user" | "model";
  parts: { text: string }[];
}

// interface GeminiMessage {
//   role: "user" | "model";
//   parts: MessagePart[];
// }

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    let body: { messages: Content[] };
    try {
      body = await req.json();
    } catch (e) {
      console.log(e);
      
      return new NextResponse("Invalid JSON in request body", { status: 400 });
    }
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!messages || !Array.isArray(messages)) {
      return new NextResponse("Messages are required and must be an array", {
        status: 400,
      });
    }
    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();
    if (!freeTrial &&  !isPro) {
      return new NextResponse("Free Trial Expired.", { status: 403 });
    }
    // Convert messages to Gemini's format
    //  const history = messages.slice(0, -1).map((msg) => ({
    //     role: msg.role === "user" ? "user" : "model",
    //     parts: msg.parts.map((part) => part.text),
    //   }));
    const history: GeminiContent[] = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.parts[0].text }],
    }));
    const chat = model.startChat({
      history,
    });

    // Send the last message
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const responseText = await result.response.text();

    // Format the response
    const response = {
      role: "model",
      parts: [{ text: responseText }],
      messages: [
        ...messages,
        {
          role: "model",
          parts: [{ text: responseText }],
        },
      ],
    };
    if(!isPro){
    await increaseApiLimit();
    }
    return NextResponse.json(response);
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal done Error", { status: 500 });
  }
}
