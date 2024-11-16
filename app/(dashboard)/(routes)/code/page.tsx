"use client";

import axios from "axios";
import * as z from "zod";
import { Heading } from "@/components/Heading";
import { Code2, Copy, Check, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import hottoast from "react-hot-toast";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Toast, ToastProvider } from "@/components/ui/toast";
import { useProModal } from "@/hooks/use-pro-modal";

const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt is required.",
  }),
  language: z.string().default("javascript"),
});

interface MessagePart {
  text: string;
}

interface GeminiMessage {
  role: "user" | "model";
  parts: MessagePart[];
}

const CodeGenerationPage = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      language: "javascript",
    },
  });
  const proModal = useProModal();
  const isLoading = form.formState.isSubmitting;
  const router = useRouter();
  const [messages, setMessages] = useState<GeminiMessage[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const onCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast({
      description: "Code copied to clipboard!",
      duration: 3000,
    });
    setTimeout(() => {
      setCopiedIndex(null);
    }, 3000);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: GeminiMessage = {
        role: "user",
        parts: [{ text: values.prompt }],
      };
      const newMessages = [...messages, userMessage];

      const response = await axios.post("/api/code", {
        messages: newMessages,
        language: values.language,
      });

      setMessages((current) => [...current, userMessage, response.data]);
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        hottoast.error("something went wrong");
      }
    } finally {
      router.refresh();
    }
  };

  return (
    <ToastProvider>
      <div>
        <Heading
          title="Code Generation"
          description="Generate code in multiple programming languages."
          icon={Code2}
          iconColor="text-green-500"
          bgColor="bg-green-500/10"
        />
        <div className="px-4 lg:px-8">
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
              >
                <FormField
                  name="prompt"
                  render={({ field }) => (
                    <FormItem className="col-span-12 lg:col-span-8">
                      <FormControl className="m-0 p-0">
                        <Input
                          className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                          disabled={isLoading}
                          placeholder="Describe the code you want to generate..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem className="col-span-12 lg:col-span-2">
                      <Select
                        disabled={isLoading}
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue defaultValue={field.value} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                          <SelectItem value="rust">Rust</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                {/* <Button
                  className="col-span-12 lg:col-span-2 w-full"
                  disabled={isLoading}
                >
                  Generate
                </Button> */}
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
            {/* {isLoading && (
              <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                <Loader />
              </div>
            )} */}
            {isLoading && (
              <div className="p-20">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin" />
                </div>
              </div>
            )}
            {messages.length === 0 && !isLoading && (
              <div className="flex items-center justify-center p-8 rounded-lg w-full bg-muted">
                <p className="text-sm text-muted-foreground">
                  No code generated yet. Start by describing what you want to
                  create!
                </p>
              </div>
            )}
            <div className="flex flex-col-reverse gap-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-8 w-full flex items-start gap-x-8 rounded-lg",
                    message.role === "user"
                      ? "bg-white border border-black/10"
                      : "bg-muted"
                  )}
                >
                  {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                  <div className="flex flex-col w-full">
                    {message.role === "user" ? (
                      <p className="text-sm">{message.parts[0].text}</p>
                    ) : (
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-4 h-8 w-8"
                          onClick={() => onCopy(message.parts[0].text, index)}
                        >
                          {copiedIndex === index ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <pre className="bg-black/10 p-4 rounded-lg overflow-x-auto">
                          <code>{message.parts[0].text}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Toast />
      </div>
    </ToastProvider>
  );
};

export default CodeGenerationPage;
