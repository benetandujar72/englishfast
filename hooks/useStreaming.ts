"use client";

import { useState, useCallback, useRef } from "react";
import type { ConvMode } from "@prisma/client";

interface UseStreamingOptions {
  onCorrections?: (corrections: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: string) => void;
}

interface StreamMessage {
  role: "user" | "assistant";
  content: string;
}

export function useStreaming(options?: UseStreamingOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (
      messages: StreamMessage[],
      mode: ConvMode,
      grammarFocus?: string,
      conversationId?: string
    ) => {
      setIsStreaming(true);
      setStreamingText("");
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages, mode, grammarFocus, conversationId }),
          cache: "no-store",
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          options?.onError?.(errorText || `Error: ${response.status}`);
          return;
        }

        if (!response.body) {
          options?.onError?.("No response body");
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events from the Anthropic stream
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith("event: ")) continue;
            if (!line.startsWith("data: ")) continue;

            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (
                parsed.type === "content_block_delta" &&
                parsed.delta?.type === "text_delta" &&
                parsed.delta?.text
              ) {
                fullText += parsed.delta.text;
                setStreamingText(fullText);
              }
            } catch {
              // Non-JSON data, skip
            }
          }
        }

        // Parse corrections from the complete text
        const correctionsMatch = fullText.match(
          /\[CORRECTIONS\]([\s\S]*?)$/
        );
        if (correctionsMatch) {
          options?.onCorrections?.(correctionsMatch[1].trim());
        }

        options?.onComplete?.(fullText);
        return fullText;
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          options?.onError?.((error as Error).message);
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [options]
  );

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { sendMessage, isStreaming, streamingText, abort, setStreamingText };
}
