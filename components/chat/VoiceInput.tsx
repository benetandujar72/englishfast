"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mic, MicOff } from "lucide-react";

interface VoiceInputProps {
  isListening: boolean;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function VoiceInput({
  isListening,
  isSupported,
  onStart,
  onStop,
}: VoiceInputProps) {
  if (!isSupported) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={isListening ? onStop : onStart}
      className={cn(
        "shrink-0",
        isListening &&
          "text-red-500 hover:text-red-600 animate-pulse"
      )}
      title={isListening ? "Stop recording" : "Start voice input"}
    >
      {isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
}
