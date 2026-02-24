"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { AudioRecorder } from "@/components/speaking/AudioRecorder";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useReadingTrainer, type ReadingAnalyzeResult } from "@/hooks/useReadingTrainer";
import {
  type ReadingLevel,
  pickRandomReadingFragment,
} from "@/lib/reading-training";

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

export default function EntrenoPage() {
  const [level, setLevel] = useState<ReadingLevel>("A1");
  const [subtitleLanguage, setSubtitleLanguage] = useState("es");
  const [fragment, setFragment] = useState(() => pickRandomReadingFragment("A1"));
  const [result, setResult] = useState<ReadingAnalyzeResult | null>(null);
  const [showSpanishText, setShowSpanishText] = useState(true);

  const recorder = useAudioRecorder();
  const trainer = useReadingTrainer();

  const canAnalyze = useMemo(
    () => Boolean(recorder.audioBlob && fragment.textEn.trim()),
    [recorder.audioBlob, fragment.textEn]
  );

  const nextFragment = () => {
    setFragment(pickRandomReadingFragment(level));
    setResult(null);
    recorder.reset();
  };

  const handleAnalyze = async () => {
    if (!recorder.audioBlob) return;
    const feedback = await trainer.analyze({
      audioBlob: recorder.audioBlob,
      prompt: fragment.textEn,
      targetLevel: level,
      subtitleLanguage,
    });
    setResult(feedback);
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Entreno de lectura</h1>
        <p className="text-sm text-muted-foreground">
          Lee fragmentos en voz alta en ingles y recibe feedback rapido en ingles +
          subtitulos en tu idioma (por defecto, castellano).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuracion</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span>Nivel</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as ReadingLevel)}
              className="w-full rounded-md border bg-background px-3 py-2"
            >
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span>Idioma de subtitulos</span>
            <select
              value={subtitleLanguage}
              onChange={(e) => setSubtitleLanguage(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
            >
              <option value="es">Espanol (default)</option>
              <option value="en">English</option>
              <option value="pt">Portugues</option>
              <option value="fr">Frances</option>
            </select>
          </label>

          <div className="flex items-end">
            <Button onClick={nextFragment} variant="secondary" className="w-full">
              Nuevo fragmento
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fragmento para leer en voz alta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Level {fragment.level}</Badge>
            <Badge variant="outline">{fragment.topic}</Badge>
          </div>
          <Textarea value={fragment.textEn} readOnly rows={4} />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Paso 1: lee en ingles. Paso 2: puedes apoyar con version en castellano.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSpanishText((v) => !v)}
            >
              {showSpanishText ? "Ocultar castellano" : "Mostrar castellano"}
            </Button>
          </div>
          {showSpanishText && (
            <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
              {fragment.textEs}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grabacion y analisis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AudioRecorder
            isRecording={recorder.isRecording}
            durationSec={recorder.durationSec}
            onStart={recorder.startRecording}
            onStop={recorder.stopRecording}
          />
          {recorder.error && (
            <p className="text-sm text-destructive">Recorder error: {recorder.error}</p>
          )}
          {trainer.error && (
            <p className="text-sm text-destructive">Analyze error: {trainer.error}</p>
          )}
          <Button onClick={handleAnalyze} disabled={!canAnalyze || trainer.isAnalyzing}>
            {trainer.isAnalyzing ? "Evaluando..." : "Evaluar lectura"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback de lectura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScoreRow label="Pronunciation" value={result.scores.pronunciation} />
            <ScoreRow label="Fluency" value={result.scores.fluency} />
            <ScoreRow label="Clarity" value={result.scores.clarity} />
            <ScoreRow label="Overall" value={result.scores.overall} />

            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">Transcript (EN)</p>
              <p className="mt-1 text-muted-foreground">{result.transcript}</p>
            </div>

            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">Feedback (English)</p>
              <p className="mt-1 text-muted-foreground">{result.feedbackEnglish}</p>
            </div>

            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">Subtitulos ({subtitleLanguage})</p>
              <p className="mt-1 text-muted-foreground">{result.feedbackSubtitle}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border p-3 text-sm">
                <p className="font-medium">Pronunciation tips (EN)</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                  {result.pronunciationTipsEnglish.map((tip, idx) => (
                    <li key={`${tip}-${idx}`}>{tip}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border p-3 text-sm">
                <p className="font-medium">Tips subtitulados ({subtitleLanguage})</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                  {result.pronunciationTipsSubtitle.map((tip, idx) => (
                    <li key={`${tip}-${idx}`}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border p-3 text-sm">
                <p className="font-medium">Suggested reading (EN)</p>
                <p className="mt-1 text-muted-foreground">{result.suggestedReadingEnglish}</p>
              </div>
              <div className="rounded-md border p-3 text-sm">
                <p className="font-medium">Lectura sugerida ({subtitleLanguage})</p>
                <p className="mt-1 text-muted-foreground">{result.suggestedReadingSubtitle}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
