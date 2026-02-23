"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface SpeakingFeedbackPanelProps {
  transcript: string;
  strength: string;
  priorityFix: string;
  retryPrompt: string;
  estimatedLevel: string;
  scores: {
    pronunciation: number;
    fluency: number;
    grammar: number;
    lexicalRange: number;
    overall: number;
  };
  referenceAudioBase64: string | null;
  referenceAudioMimeType: string | null;
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{Math.round(value)}</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

export function SpeakingFeedbackPanel({
  transcript,
  strength,
  priorityFix,
  retryPrompt,
  estimatedLevel,
  scores,
  referenceAudioBase64,
  referenceAudioMimeType,
}: SpeakingFeedbackPanelProps) {
  const referenceAudioSrc =
    referenceAudioBase64 && referenceAudioMimeType
      ? `data:${referenceAudioMimeType};base64,${referenceAudioBase64}`
      : null;

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg">Speaking feedback</CardTitle>
        <div className="flex items-center gap-2">
          <Badge>Overall {Math.round(scores.overall)}/100</Badge>
          <Badge variant="outline">Estimated {estimatedLevel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScoreRow label="Pronunciation" value={scores.pronunciation} />
        <ScoreRow label="Fluency" value={scores.fluency} />
        <ScoreRow label="Grammar" value={scores.grammar} />
        <ScoreRow label="Lexical range" value={scores.lexicalRange} />

        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium">Transcript</p>
          <p className="mt-1 text-muted-foreground">{transcript || "No transcript."}</p>
        </div>

        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium">Strength</p>
          <p className="mt-1 text-muted-foreground">{strength}</p>
        </div>

        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium">Priority fix</p>
          <p className="mt-1 text-muted-foreground">{priorityFix}</p>
        </div>

        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium">Retry coach</p>
          <p className="mt-1 text-muted-foreground">{retryPrompt}</p>
        </div>

        {referenceAudioSrc && (
          <div className="rounded-md border p-3">
            <p className="mb-2 text-sm font-medium">Reference pronunciation</p>
            <audio controls src={referenceAudioSrc} className="w-full" />
          </div>
        )}

        {!referenceAudioSrc && (
          <Button variant="outline" disabled>
            Reference audio unavailable
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
