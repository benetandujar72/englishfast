"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Web Speech API types (not included in default TS lib)
interface SpeechRecognitionType {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionType;
    webkitSpeechRecognition: new () => SpeechRecognitionType;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

interface UseVoiceInputOptions {
  lang?: string;
  continuous?: boolean;
  onTranscript?: (text: string) => void;
}

export function useVoiceInput(options?: UseVoiceInputOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const manualStopRef = useRef(false);

  useEffect(() => {
    setIsSupported(
      typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) return;
    if (isListening) return;

    setError(null);
    manualStopRef.current = false;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = options?.lang ?? "en-US";
    recognition.continuous = options?.continuous ?? true;
    recognition.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      const text = finalText + interimText;
      setTranscript(text);
      options?.onTranscript?.(text);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      // "aborted" is expected when stopping recognition manually.
      if (event?.error !== "aborted" && event?.error !== "no-speech") {
        console.error("Speech recognition error:", event.error);
        if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
          setError("Permiso de microfono denegado. Revisa permisos del navegador.");
        } else if (event?.error === "network") {
          setError("Error de red en reconocimiento de voz. Intenta de nuevo.");
        } else {
          setError(`Error de reconocimiento: ${event?.error ?? "desconocido"}`);
        }
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (err) {
      setIsListening(false);
      setError(
        err instanceof Error
          ? `No se pudo iniciar la transcripcion: ${err.message}`
          : "No se pudo iniciar la transcripcion."
      );
    }
  }, [isSupported, isListening, options]);

  const stopListening = useCallback(() => {
    manualStopRef.current = true;
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    clearError,
    setTranscript,
  };
}
