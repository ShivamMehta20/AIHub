"use client";

import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import {
  Code,
  ImageIcon,
  LayoutDashboard,
  MessagesSquare,
  MusicIcon,
  Settings,
  VideoIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { FreeCounter } from "@/components/free-counter";

const font = Montserrat({ weight: "600", subsets: ["latin"] });
const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Conversation",
    icon: MessagesSquare,
    href: "/conversation",
    color: "text-violet-500",
  },
  {
    label: "Image Generation",
    icon: ImageIcon,
    href: "/image",
    color: "text-pink-700",
  },
  {
    label: "Video Generation",
    icon: VideoIcon,
    href: "/video",
    color: "text-orange-700",
  },
  {
    label: "Music Generation",
    icon: MusicIcon,
    href: "/music",
    color: "text-emerald-700",
  },
  {
    label: "Code Generation",
    icon: Code,
    href: "/code",
    color: "text-green-700",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];
interface SidebarProps {
  apiLimitCount:number;
  isPro:boolean
}
const SideBar = ({
  apiLimitCount=0,
  isPro=false,
}:SidebarProps) => {
    const pathname = usePathname()
  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14 ">
          <div className="relative w-8 h-8 mr-4">
            <Image alt="logo" src="/logo.png" fill />
          </div>
          <h1 className={cn("text-2xl font-bold", font.className)}>AIHub</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              href={route.href}
              key={route.href}
              className={cn("text-sm group flex p-3 w-full justify-start font-medium cursor-pointer  hover:text-white hover:bg-white/10 rounded-lg transition",route.href === pathname ? "text-white bg-white/10" : "text-zinc-400")}  >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <FreeCounter isPro={isPro}
      apiLimitCount={apiLimitCount}
      />
    </div>
  );
};
export default SideBar;
