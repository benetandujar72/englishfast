"use client";

import { useMemo, useState } from "react";
import type { SpeakingMode } from "@prisma/client";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useSpeakingSession } from "@/hooks/useSpeakingSession";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AudioRecorder } from "@/components/speaking/AudioRecorder";
import { SpeakingFeedbackPanel } from "@/components/speaking/SpeakingFeedbackPanel";
import { AdaptiveHintCard } from "@/components/speaking/AdaptiveHintCard";

const defaultPromptByMode: Record<SpeakingMode, string> = {
  PRONUNCIATION: "Read this sentence clearly: I am improving my English every day.",
  SHORT_ANSWER:
    "Introduce yourself and explain why learning English is important for your goals.",
  PICTURE_DESCRIPTION:
    "Describe the image in simple present tense and include at least five key details.",
  GUIDED_CONVERSATION:
    "Talk for 45 seconds about your daily routine and one challenge you had this week.",
};

export default function SpeakingPracticePage() {
  const [mode, setMode] = useState<SpeakingMode>("SHORT_ANSWER");
  const [targetLevel, setTargetLevel] = useState("A2");
  const [prompt, setPrompt] = useState(defaultPromptByMode.SHORT_ANSWER);
  const [topic, setTopic] = useState("Daily communication");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<Awaited<
    ReturnType<ReturnType<typeof useSpeakingSession>["analyzeAndSave"]>
  > | null>(null);

  const recorder = useAudioRecorder();
  const speaking = useSpeakingSession();

  const adaptiveQuery = trpc.speaking.getAdaptiveNext.useQuery(
    { sessionId: sessionId ?? "" },
    { enabled: Boolean(sessionId) }
  );

  const canAnalyze = useMemo(
    () => Boolean(recorder.audioBlob && prompt.trim()),
    [recorder.audioBlob, prompt]
  );

  const handleModeChange = (newMode: SpeakingMode) => {
    setMode(newMode);
    setPrompt(defaultPromptByMode[newMode]);
  };

  const handleAnalyze = async () => {
    if (!recorder.audioBlob || !prompt.trim()) return;
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const created = await speaking.startSession({
        mode,
        topic,
        targetLevel,
      });
      activeSessionId = created.id;
      setSessionId(created.id);
    }

    const result = await speaking.analyzeAndSave(activeSessionId, {
      audioBlob: recorder.audioBlob,
      prompt,
      mode,
      targetLevel,
      durationSec: recorder.durationSec,
      imageFile,
    });
    setFeedback(result);
    recorder.reset();
    await adaptiveQuery.refetch();
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Speaking practice</h1>
        <p className="text-sm text-muted-foreground">
          Record your answer, get AI feedback, and retry with adaptive coaching.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span>Mode</span>
              <select
                value={mode}
                onChange={(e) => handleModeChange(e.target.value as SpeakingMode)}
                className="w-full rounded-md border bg-background px-3 py-2"
              >
                <option value="PRONUNCIATION">Pronunciation</option>
                <option value="SHORT_ANSWER">Short answer</option>
                <option value="PICTURE_DESCRIPTION">Picture description</option>
                <option value="GUIDED_CONVERSATION">Guided conversation</option>
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span>Target level</span>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2"
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B1+">B1+</option>
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span>Topic</span>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Work, travel, routines..."
              />
            </label>
          </div>

          <label className="space-y-1 text-sm">
            <span>Prompt</span>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Write the speaking task..."
            />
          </label>

          <label className="space-y-1 text-sm">
            <span>Optional image (vision mode support)</span>
            <Input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="space-y-3 rounded-md border p-3">
            <AudioRecorder
              isRecording={recorder.isRecording}
              durationSec={recorder.durationSec}
              onStart={recorder.startRecording}
              onStop={recorder.stopRecording}
            />
            {recorder.error && (
              <p className="text-sm text-destructive">Recorder error: {recorder.error}</p>
            )}
            {speaking.error && (
              <p className="text-sm text-destructive">Analyze error: {speaking.error}</p>
            )}
            <Button
              onClick={handleAnalyze}
              disabled={!canAnalyze || speaking.isAnalyzing}
            >
              {speaking.isAnalyzing ? "Analyzing..." : "Analyze speaking"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {feedback && (
        <SpeakingFeedbackPanel
          transcript={feedback.transcript}
          strength={feedback.strength}
          priorityFix={feedback.priorityFix}
          retryPrompt={feedback.retryPrompt}
          estimatedLevel={feedback.estimatedLevel}
          scores={feedback.scores}
          referenceAudioBase64={feedback.referenceAudioBase64}
          referenceAudioMimeType={feedback.referenceAudioMimeType}
        />
      )}

      {adaptiveQuery.data && (
        <AdaptiveHintCard
          focusSkill={adaptiveQuery.data.focusSkill}
          nextMode={adaptiveQuery.data.nextMode}
          nextLevel={adaptiveQuery.data.nextLevel}
          rationale={adaptiveQuery.data.rationale}
        />
      )}
    </div>
  );
}
