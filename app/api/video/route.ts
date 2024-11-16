import { auth } from "@clerk/nextjs/server";
import {  checkApiLimit,increaseApiLimit} from "@/lib/api-limit";
import { NextResponse } from "next/server";
import Replicate from "replicate";
import { checkSubscription } from "@/lib/subscription";

const replicate=new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,}
);



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
    const input = {
      prompt: prompt
  };
  const freeTrial = await checkApiLimit();
  const isPro=await checkSubscription()
    if (!freeTrial && !isPro) {
      return new NextResponse("Free Trial Expired.",{status:403})
    }
  const response = await replicate.run("anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351", { input }) as string[];
if (!isPro) {
  await increaseApiLimit(); 
}
  const videoStream = response[0] as unknown; // Assuming the video is in the first element.

  // Handle ReadableStream conversion
  if (videoStream instanceof ReadableStream) {
    const reader = videoStream.getReader();
    const chunks = [];
    let done, value;

    // Read the stream in chunks
    while (!done) {
      ({ done, value } = await reader.read());
      if (value) {
        chunks.push(value);
      }
    }

    // Create a Buffer from the chunks
    const buffer = Buffer.concat(chunks);

    // You can save this buffer to the file system or convert it to base64
    // Here's an example of converting the buffer to base64:
    const base64Video = buffer.toString('base64');

    // Return the base64-encoded video
    return NextResponse.json({
      video: `data:video/mp4;base64,${base64Video}`,
    });
  }

  return new NextResponse("No video stream found", { status: 400 });
  } catch (error) {
    console.log("[VIDEO_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}



