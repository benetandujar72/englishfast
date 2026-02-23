"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Square } from "lucide-react";

interface AudioRecorderProps {
  isRecording: boolean;
  durationSec: number;
  onStart: () => void | Promise<void>;
  onStop: () => void;
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioRecorder({
  isRecording,
  durationSec,
  onStart,
  onStop,
}: AudioRecorderProps) {
  return (
    <div className="flex items-center gap-3">
      {isRecording ? (
        <Button variant="destructive" onClick={onStop}>
          <Square className="mr-2 h-4 w-4" />
          Stop
        </Button>
      ) : (
        <Button onClick={onStart}>
          <Mic className="mr-2 h-4 w-4" />
          Record
        </Button>
      )}

      <Badge variant="outline">{formatDuration(durationSec)}</Badge>
      {isRecording ? <Badge>Recording</Badge> : <Badge variant="secondary">Ready</Badge>}
    </div>
  );
}
