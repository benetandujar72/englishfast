export const CLAUDE_DEFAULT_MODEL =
  process.env.CLAUDE_DEFAULT_MODEL ?? "claude-sonnet-4-5-20250929";

export const CLAUDE_CHAT_MODEL =
  process.env.CLAUDE_CHAT_MODEL ?? CLAUDE_DEFAULT_MODEL;

export const CLAUDE_DIARY_MODEL =
  process.env.CLAUDE_DIARY_MODEL ?? CLAUDE_DEFAULT_MODEL;

export const CLAUDE_EXAM_MODEL =
  process.env.CLAUDE_EXAM_MODEL ?? CLAUDE_DEFAULT_MODEL;

export const GEMINI_DEFAULT_MODEL =
  process.env.GEMINI_DEFAULT_MODEL ?? "gemini-3.1-pro-preview";

export const GEMINI_STT_MODEL =
  process.env.GEMINI_STT_MODEL ?? GEMINI_DEFAULT_MODEL;

export const GEMINI_SPEAKING_MODEL =
  process.env.GEMINI_SPEAKING_MODEL ?? "gemini-2.0-flash";

export const GEMINI_FALLBACK_MODELS = (
  process.env.GEMINI_FALLBACK_MODELS ?? "gemini-2.0-flash"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
