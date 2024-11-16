import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {  checkApiLimit,increaseApiLimit} from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_API_URL = "https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, amount = 1, resolution = "512x512" } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!STABILITY_API_KEY) {
      return new NextResponse("Stability API Key not configured", { status: 500 });
    }

    // Parse resolution
    const [width, height] = resolution.split('x').map(Number);
    const freeTrial = await checkApiLimit();
    const isPro= await checkSubscription()
    if (!freeTrial && !isPro) {
      return new NextResponse("Free Trial Expired.",{status:403})
    }
    const response = await fetch(STABILITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1,
          },
        ],
        cfg_scale: 7,
        height: height,
        width: width,
        samples: parseInt(amount),
        steps: 30,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const responseData = await response.json();
    const imageUrls = responseData.artifacts.map((image: any) => {
      // Convert base64 to blob URL
      const base64Data = image.base64;
      const blobData = Buffer.from(base64Data, 'base64');
      return `data:image/png;base64,${blobData.toString('base64')}`;
    });
    if (!isPro) {
      
      await increaseApiLimit();
    }
    return NextResponse.json({ imageUrls });
    
  } catch (error) {
    console.log("[IMAGE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}