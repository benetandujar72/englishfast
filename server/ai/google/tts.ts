interface TtsOptions {
  text: string;
  languageCode?: string;
  voiceName?: string;
}

export interface TtsResult {
  audioContentBase64: string;
  mimeType: string;
}

function getGoogleApiKey() {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) {
    throw new Error("Missing GOOGLE_AI_API_KEY environment variable.");
  }
  return key;
}

export async function synthesizeSpeechWithGoogle({
  text,
  languageCode = "en-US",
  voiceName = "en-US-Neural2-F",
}: TtsOptions): Promise<TtsResult> {
  const apiKey = getGoogleApiKey();
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode,
          name: voiceName,
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 0.95,
        },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google TTS failed (${res.status}): ${body}`);
  }

  const payload = (await res.json()) as { audioContent?: string };
  if (!payload.audioContent) {
    throw new Error("Google TTS did not return audio content.");
  }

  return {
    audioContentBase64: payload.audioContent,
    mimeType: "audio/mpeg",
  };
}
