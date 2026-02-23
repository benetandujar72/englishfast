"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CorrectionBlock } from "./CorrectionBlock";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

function splitCorrections(content: string) {
  const idx = content.indexOf("[CORRECTIONS]");
  if (idx === -1) return { text: content, corrections: null };
  return {
    text: content.substring(0, idx).trim(),
    corrections: content.substring(idx + "[CORRECTIONS]".length).trim(),
  };
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const { text, corrections } = isUser
    ? { text: message.content, corrections: null }
    : splitCorrections(message.content);

  return (
    <div
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs font-bold",
            isUser
              ? "bg-blue-500 text-white"
              : "bg-emerald-500 text-white"
          )}
        >
          {isUser ? "You" : "AI"}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-blue-500 text-white"
            : "bg-muted text-foreground"
        )}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {text}
          {isStreaming && (
            <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-current" />
          )}
        </div>

        {corrections && !isStreaming && (
          <CorrectionBlock correctionsText={corrections} />
        )}
      </div>
    </div>
  );
}
