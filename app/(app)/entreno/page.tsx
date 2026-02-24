"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { AudioRecorder } from "@/components/speaking/AudioRecorder";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useReadingTrainer, type ReadingAnalyzeResult } from "@/hooks/useReadingTrainer";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { SessionFlowHeader } from "@/components/learning/SessionFlowHeader";
import {
  CEFR_COMPETENCIES,
  COMPETENCY_FILTER_OPTIONS,
  type ReadingLength,
  type CompetencyFocus,
  type ReadingLevel,
  TOPIC_FILTER_OPTIONS,
  type TopicFilter,
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
  const [level, setLevel] = useState<ReadingLevel>("A2");
  const [duration, setDuration] = useState<ReadingLength>("medium");
  const [topicFilter, setTopicFilter] = useState<TopicFilter>("general");
  const [competencyFocus, setCompetencyFocus] =
    useState<CompetencyFocus>("comprension");
  const [subtitleLanguage, setSubtitleLanguage] = useState("es");
  const [fragment, setFragment] = useState(() =>
    pickRandomReadingFragment("A2", "medium", "general", "comprension")
  );
  const [result, setResult] = useState<ReadingAnalyzeResult | null>(null);
  const [showSpanishText, setShowSpanishText] = useState(true);
  const [liveSubtitle, setLiveSubtitle] = useState("");
  const [liveTranslateError, setLiveTranslateError] = useState<string | null>(null);
  const [isTranslatingLive, setIsTranslatingLive] = useState(false);
  const [translationCache, setTranslationCache] = useState<Record<string, string>>({});

  const recorder = useAudioRecorder();
  const trainer = useReadingTrainer();
  const liveVoice = useVoiceInput({
    lang: "en-US",
    continuous: true,
  });

  const canAnalyze = useMemo(
    () => Boolean(recorder.audioBlob && fragment.textEn.trim()),
    [recorder.audioBlob, fragment.textEn]
  );

  const sentences = useMemo(
    () =>
      fragment.textEn
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [fragment.textEn]
  );

  const activeSentenceIndex = useMemo(() => {
    const spokenWords = liveVoice.transcript.trim().split(/\s+/).filter(Boolean).length;
    if (spokenWords === 0 || sentences.length === 0) return 0;

    let cumulative = 0;
    for (let i = 0; i < sentences.length; i++) {
      cumulative += sentences[i].split(/\s+/).filter(Boolean).length;
      if (spokenWords <= cumulative) return i;
    }
    return sentences.length - 1;
  }, [liveVoice.transcript, sentences]);

  const activeSentence = sentences[activeSentenceIndex] ?? "";

  const nextFragment = () => {
    setFragment(
      pickRandomReadingFragment(level, duration, topicFilter, competencyFocus)
    );
    setResult(null);
    setLiveSubtitle("");
    setLiveTranslateError(null);
    setTranslationCache({});
    liveVoice.resetTranscript();
    if (liveVoice.isListening) liveVoice.stopListening();
    recorder.reset();
  };

  useEffect(() => {
    if (!activeSentence) return;
    const cached = translationCache[activeSentence];
    if (cached) {
      setLiveSubtitle(cached);
      return;
    }

    let cancelled = false;
    setIsTranslatingLive(true);
    setLiveTranslateError(null);

    const run = async () => {
      try {
        const response = await fetch("/api/reading/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: activeSentence,
            targetLanguage: subtitleLanguage,
          }),
        });

        if (!response.ok) {
          const raw = await response.text();
          throw new Error(raw || `Translate failed (${response.status})`);
        }

        const data = (await response.json()) as { translatedText?: string };
        const translated = data.translatedText ?? activeSentence;
        if (!cancelled) {
          setLiveSubtitle(translated);
          setTranslationCache((prev) => ({ ...prev, [activeSentence]: translated }));
        }
      } catch (error) {
        if (!cancelled) {
          setLiveTranslateError(
            error instanceof Error ? error.message : "Live translation error."
          );
        }
      } finally {
        if (!cancelled) {
          setIsTranslatingLive(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [activeSentence, subtitleLanguage, translationCache]);

  const handleAnalyze = async () => {
    if (!recorder.audioBlob) return;
    const feedback = await trainer.analyze({
      audioBlob: recorder.audioBlob,
      prompt: fragment.textEn,
      targetLevel: level,
      subtitleLanguage,
      competencyFocus,
    });
    setResult(feedback);
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-4">
      <SessionFlowHeader
        title="Entreno de lectura"
        subtitle="Lee en voz alta, recibe feedback y consolida comprension por competencias."
        goalMinutes={12}
        doneMinutes={result ? 12 : Math.max(0, Math.ceil((recorder.durationSec || 0) / 60))}
        status={result ? "completed" : trainer.isAnalyzing ? "active" : "ready"}
      />

      {"A2,B1,B2,C1,C2".includes(level) && (
        <Card variant="soft">
          <CardHeader>
            <CardTitle>Competencias MCER {level}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">Comprension (oral + lectura)</p>
              <p className="mt-1 text-muted-foreground">
                {CEFR_COMPETENCIES[level as "A2" | "B1" | "B2" | "C1" | "C2"].comprension}
              </p>
            </div>
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">Hablar: interaccion</p>
              <p className="mt-1 text-muted-foreground">
                {CEFR_COMPETENCIES[level as "A2" | "B1" | "B2" | "C1" | "C2"].interaccion}
              </p>
            </div>
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">Hablar: produccion</p>
              <p className="mt-1 text-muted-foreground">
                {CEFR_COMPETENCIES[level as "A2" | "B1" | "B2" | "C1" | "C2"].produccion}
              </p>
            </div>
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">Escribir</p>
              <p className="mt-1 text-muted-foreground">
                {CEFR_COMPETENCIES[level as "A2" | "B1" | "B2" | "C1" | "C2"].escritura}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card variant="soft">
        <CardHeader>
          <CardTitle>Configuracion</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <label className="space-y-1 text-sm">
            <span>Nivel</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as ReadingLevel)}
              className="w-full rounded-md border bg-background px-3 py-2"
            >
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
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

          <label className="space-y-1 text-sm">
            <span>Duracion de lectura</span>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as ReadingLength)}
              className="w-full rounded-md border bg-background px-3 py-2"
            >
              <option value="short">Corta</option>
              <option value="medium">Media</option>
              <option value="long">Larga</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span>Tema</span>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value as TopicFilter)}
              className="w-full rounded-md border bg-background px-3 py-2"
            >
              {TOPIC_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span>Competencia foco</span>
            <select
              value={competencyFocus}
              onChange={(e) =>
                setCompetencyFocus(e.target.value as CompetencyFocus)
              }
              className="w-full rounded-md border bg-background px-3 py-2"
            >
              {COMPETENCY_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <Button onClick={nextFragment} variant="secondary" className="w-full">
              Nuevo fragmento
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card variant="soft">
        <CardHeader>
          <CardTitle>Fragmento para leer en voz alta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Level {fragment.level}</Badge>
            <Badge variant="outline">Duration {fragment.duration}</Badge>
            <Badge variant="outline">Focus {competencyFocus}</Badge>
            <Badge variant="outline">{fragment.topic}</Badge>
          </div>
          <div className="space-y-2 rounded-md border p-3">
            {sentences.map((sentence, idx) => (
              <p
                key={`${fragment.id}-${idx}`}
                className={
                  idx === activeSentenceIndex
                    ? "rounded-md bg-sky-500/10 px-2 py-1 text-sm font-medium text-sky-900 dark:text-sky-200"
                    : "px-2 py-1 text-sm text-muted-foreground"
                }
              >
                {sentence}
              </p>
            ))}
          </div>
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

      <Card variant="soft">
        <CardHeader>
          <CardTitle>Asistente en vivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={liveVoice.startListening}
              disabled={!liveVoice.isSupported || liveVoice.isListening}
              variant="secondary"
            >
              Iniciar transcripcion en vivo
            </Button>
            <Button
              onClick={liveVoice.stopListening}
              disabled={!liveVoice.isListening}
              variant="outline"
            >
              Detener
            </Button>
            <Badge variant={liveVoice.isListening ? "default" : "secondary"}>
              {liveVoice.isListening ? "Escuchando" : "En pausa"}
            </Badge>
          </div>

          {!liveVoice.isSupported && (
            <p className="text-sm text-destructive">
              Tu navegador no soporta transcripcion en vivo (Web Speech API).
            </p>
          )}

          <div className="rounded-md border p-3 text-sm">
            <p className="font-medium">Transcripcion en vivo (EN)</p>
            <p className="mt-1 text-muted-foreground">
              {liveVoice.transcript || "Empieza a leer para ver la transcripcion."}
            </p>
          </div>

          <div className="rounded-md border p-3 text-sm">
            <p className="font-medium">
              Subtitulo en vivo ({subtitleLanguage}) - frase actual
            </p>
            <p className="mt-1 text-muted-foreground">
              {isTranslatingLive
                ? "Traduciendo..."
                : liveSubtitle || "Subtitulo en espera de voz."}
            </p>
            {liveTranslateError && (
              <p className="mt-2 text-xs text-destructive">{liveTranslateError}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card variant="soft">
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
        <Card variant="elevated">
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
