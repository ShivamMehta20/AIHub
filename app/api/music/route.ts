import { auth } from "@clerk/nextjs/server";
import {  checkApiLimit,increaseApiLimit} from "@/lib/api-limit";

import { NextResponse } from "next/server";
import Replicate from "replicate";
import { checkSubscription } from "@/lib/subscription";

const replicate=new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,}
);

interface ReplicateResponse {
  audio: ReadableStream;
  spectrogram: ReadableStream;
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { prompt } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }
    const freeTrial = await checkApiLimit();
    const isPro=await checkSubscription()
    if (!freeTrial && !isPro) {
      return new NextResponse("Free Trial Expired.",{status:403})
    }
    const response = await replicate.run(
      "riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05",
      {
        input: {
          prompt_a: prompt,
        },
      }
    ) as ReplicateResponse;

    const audioReadableStream = response.audio;
    const audioBuffer = await streamToBuffer(audioReadableStream);
    if (!isPro) {
      await increaseApiLimit();
      
    }
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
      },
    });
  } catch (error) {
    console.log("[MUSIC_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function streamToBuffer(stream: ReadableStream) {
  const reader = stream.getReader();
  const chunks = [];
  let done = false;
  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      chunks.push(value);
    }
  }
  return Buffer.concat(chunks);
}

