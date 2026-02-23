"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageBubble } from "./MessageBubble";
import { ModeSelector } from "./ModeSelector";
import { VoiceInput } from "./VoiceInput";
import { useStreaming } from "@/hooks/useStreaming";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useChatStore } from "@/lib/stores/chat-store";
import { Send, Square, Clock, Type } from "lucide-react";
import type { ChatMessage } from "@/types";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    mode,
    isStreaming: storeStreaming,
    wordCount,
    sessionStart,
    addMessage,
    updateLastAssistantMessage,
    setMode,
    setStreaming,
    startSession,
    getSessionDuration,
  } = useChatStore();

  const { sendMessage, isStreaming, streamingText, abort } = useStreaming({
    onComplete: (fullText) => {
      updateLastAssistantMessage(fullText);
      setStreaming(false);
    },
    onError: (error) => {
      console.error("Stream error:", error);
      setStreaming(false);
    },
  });

  const {
    isListening,
    transcript,
    isSupported: voiceSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput();

  // Session timer display
  const [displayDuration, setDisplayDuration] = useState(0);
  useEffect(() => {
    if (!sessionStart) return;
    const timer = setInterval(() => {
      setDisplayDuration(getSessionDuration());
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStart, getSessionDuration]);

  // Update input from voice
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  // Start session on first render
  useEffect(() => {
    if (!sessionStart) startSession();
  }, [sessionStart, startSession]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    // Stop voice if active
    if (isListening) {
      stopListening();
      resetTranscript();
    }

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);
    setInput("");
    setStreaming(true);

    // Add placeholder for assistant message
    addMessage({ role: "assistant", content: "", timestamp: new Date().toISOString() });

    const allMessages = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: text },
    ];

    await sendMessage(allMessages, mode);
  }, [
    input,
    isStreaming,
    isListening,
    messages,
    mode,
    addMessage,
    sendMessage,
    setStreaming,
    stopListening,
    resetTranscript,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header with mode selector and stats */}
      <div className="border-b p-4">
        <ModeSelector value={mode} onChange={setMode} />
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(displayDuration)}
          </div>
          <div className="flex items-center gap-1">
            <Type className="h-3 w-3" />
            {wordCount} words
          </div>
          <Badge variant="outline" className="text-xs">
            {mode}
          </Badge>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex h-[50vh] items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium">Ready to practice!</p>
                <p className="text-sm">
                  Start typing or use voice input to begin your English practice
                  session.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const isLast = i === messages.length - 1;
            const isStreamingMsg = isLast && msg.role === "assistant" && isStreaming;

            return (
              <MessageBubble
                key={i}
                message={
                  isStreamingMsg
                    ? { ...msg, content: streamingText }
                    : msg
                }
                isStreaming={isStreamingMsg}
              />
            );
          })}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t p-4">
        <Card className="flex items-end gap-2 p-2">
          <VoiceInput
            isListening={isListening}
            isSupported={voiceSupported}
            onStart={startListening}
            onStop={stopListening}
          />

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message in English..."
            className="min-h-[40px] max-h-[120px] flex-1 resize-none border-0 bg-transparent focus-visible:ring-0"
            rows={1}
            disabled={isStreaming}
          />

          {isStreaming ? (
            <Button
              variant="destructive"
              size="icon"
              onClick={abort}
              className="shrink-0"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim()}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
