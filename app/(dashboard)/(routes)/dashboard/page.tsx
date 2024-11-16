"use client"

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, Code, ImageIcon, MessagesSquare, MusicIcon, VideoIcon } from "lucide-react";
import { useRouter } from "next/navigation";


const tool = [
  {
    label: "Conversation",
    icon: MessagesSquare,
    href: "/conversation",
    color: "text-violet-500",
    bgcolor: "bg-violet-500/10",
  },
  {
    label: "Image Generation",
    icon: ImageIcon,
    href: "/image",
    color: "text-pink-700", 
    bgcolor: "bg-pink-700/10", 
  },
  {
    label: "Video Generation",
    icon: VideoIcon,
    href: "/video",
    color: "text-orange-700",
    bgcolor: "bg-orange-700/10",
  },
  {
    label: "Music Generation",
    icon: MusicIcon,
    href: "/music",
    color: "text-emerald-700",
    bgcolor: "bg-emerald-700/10",
  },
  {
    label: "Code Generation",
    icon: Code,
    href: "/code",
    color: "text-green-700",
    bgcolor: "bg-green-700/10",
  }
];

export default function Home() {
const router =useRouter()
  return (
    <div>
     <div className="mb-8 space-y-4">
<h2 className="text-2xl md:text-4xl font-bold text-center">
  <p className="text-muted-foreground font-light text-sm md:text-lg text-center">chat with smartest AI - Experience the power of  AI</p>
  explore the power of AI</h2>
     </div>
     <div className="tx-4 md:px-20 lg:px-32 space-y-4">
{tool.map((tool) => (
  <Card key={tool.href} className="p-4 border-black/5 flex items-center
   justify-between hover:shadow-md transition cursor-pointer" onClick={()=> router.push(tool.href)}>
  <div className="flex items-center gap-x-4">
    <div className={cn("p-2 w-fit rounded-md",tool.bgcolor)}>
    <tool.icon className={cn("w-8 h-8 ",tool.color)}/>
    </div>
    <div className="font-semibold">
{tool.label}
    </div>
  </div>
  <ArrowRight className="w-5 h-5"/>
  </Card>
))}

     </div>
    </div>
  );
}
