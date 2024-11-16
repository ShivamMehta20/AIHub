"use client";
import axios from "axios";
import * as z from "zod";
import { Heading } from "@/components/Heading";
import { Loader2, VideoIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProModal } from "@/hooks/use-pro-modal";
import toast from "react-hot-toast";

const VideoPage = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });
  const isLoading = form.formState.isSubmitting;
  const router = useRouter();
  const [video, setVideo] = useState<string>();
  const proModal = useProModal();
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setVideo(undefined);

      const response = await axios.post("/api/video", values);

      console.log(response.data.video);
      setVideo(response.data.video);
      form.reset();
    } catch (error: any) {
      // TO_DO : Open Pro Model
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("something went wrong...");
      }
    } finally {
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Video Generation"
        description="Turn Your Prompt To Video."
        icon={VideoIcon}
        iconColor="text-orange-700"
        bgColor="bg-orange-500/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <Form {...form}>
            <form
              action=""
              onSubmit={form.handleSubmit(onSubmit)}
              className=" rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm
        grid grid-cols-12 gap-2"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none 
            focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="Clown Fish swiming around a coral reef.. "
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                className="col-span-12 lg:col-span-2 w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </div>
                ) : (
                  "Generate"
                )}
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-20">
              <div className="flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
              </div>
            </div>
          )}
          {!video && !isLoading && (
            <div className="flex items-center justify-center p-8 rounded-lg w-full bg-muted">
              <p className="text-sm text-muted-foreground">
                No Video generated yet. Start by describing what you want to
                create!
              </p>
            </div>
          )}

          {video && (
            <video
              className="w-full aspect-video mt-8 rounded-lg border bg-black"
              controls
            >
              <source src={video} type="video/mp4" />
            </video>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
