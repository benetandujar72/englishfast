"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ConvMode } from "@prisma/client";

interface ModeSelectorProps {
  value: ConvMode;
  onChange: (mode: ConvMode) => void;
}

const MODES: { value: ConvMode; label: string; icon: string }[] = [
  { value: "CHAT", label: "Free Chat", icon: "💬" },
  { value: "ROLEPLAY", label: "Roleplay", icon: "🎭" },
  { value: "DEBATE", label: "Debate", icon: "⚖️" },
  { value: "INTERVIEW", label: "Interview", icon: "💼" },
  { value: "STORYTELLING", label: "Story", icon: "📖" },
];

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as ConvMode)}>
      <TabsList className="grid w-full grid-cols-5">
        {MODES.map((mode) => (
          <TabsTrigger
            key={mode.value}
            value={mode.value}
            className="text-xs"
          >
            <span className="mr-1">{mode.icon}</span>
            <span className="hidden sm:inline">{mode.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
