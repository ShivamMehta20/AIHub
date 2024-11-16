"use client";

import axios from "axios";
import { useProModal } from "@/hooks/use-pro-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import {
    Check,
  Code,
  ImageIcon,
  MessagesSquare,
  MusicIcon,
  VideoIcon,
  Zap,
} from "lucide-react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useState } from "react";
import toast from "react-hot-toast";

export const ProModal = () => {
  const proModal = useProModal();
  const [loading,setLoading]=useState(false);
  const onSubscribe= async()=>{
    try {
      setLoading(true)
        const response = await axios.get("/api/stripe")
        window.location.href=response.data.url
    } catch (error) {
      console.log(error);
      
toast.error("something went wrong")
    }finally{
      setLoading(false)
    }
  }
  const tool = [
    {
      label: "Conversation",
      icon: MessagesSquare,
      color: "text-violet-500",
      bgcolor: "bg-violet-500/10",
    },
    {
      label: "Image Generation",
      icon: ImageIcon,
      color: "text-pink-700",
      bgcolor: "bg-pink-700/10",
    },
    {
      label: "Video Generation",
      icon: VideoIcon,
      color: "text-orange-700",
      bgcolor: "bg-orange-700/10",
    },
    {
      label: "Music Generation",
      icon: MusicIcon,
      color: "text-emerald-700",
      bgcolor: "bg-emerald-700/10",
    },
    {
      label: "Code Generation",
      icon: Code,
      color: "text-green-700",
      bgcolor: "bg-green-700/10",
    },
  ];
  return (
    <div>
      <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle
              className="flex justify-center items-center flex-col 
                        gap-y-4 pb-2"
            >
              <div className="flex items-center gap-x-2 font-bold py-1">
                Upgrade to AIHub
                <Badge className="uppercase text-sm py-1" variant="premium">
                  Pro
                </Badge>
              </div>
            </DialogTitle>
            <DialogDescription className="text-center pt-2 space-y-2 text-zinc-900 font-medium">
              {tool.map((t) => (
                <Card
                  key={t.label}
                  className="p-3 ☐ border-black/5 flex items-center
                                    justify-between">
                  <div className="flex items-center gap-x-4">
                    <div className={cn("p-2 w-fit rounded-md",t.bgcolor)}>
                        <t.icon className={cn("w-6 h-6 ",t.color)}/>
                    </div>
                    <div className="font-semibold text-sm">
                        {t.label}
                    </div>
                  </div>
                  <Check className="text-primary w-5 h-5 "/>
                </Card>
              ))}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
            disabled={loading}
            onClick={onSubscribe}
            size="lg"
            variant="premium"
            className="w-full ">
                Upgrade
                <Zap className="w-4 h-4 ml-2 fill-white"/>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
