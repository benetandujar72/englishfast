"use client";

import { create } from "zustand";
import type { ConvMode } from "@prisma/client";
import type { ChatMessage } from "@/types";

interface ChatState {
  messages: ChatMessage[];
  mode: ConvMode;
  conversationId: string | null;
  isStreaming: boolean;
  grammarFocus: string;
  sessionStart: number | null;
  wordCount: number;

  addMessage: (msg: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  setMode: (mode: ConvMode) => void;
  setConversationId: (id: string | null) => void;
  setStreaming: (val: boolean) => void;
  setGrammarFocus: (focus: string) => void;
  startSession: () => void;
  getSessionDuration: () => number;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  mode: "CHAT",
  conversationId: null,
  isStreaming: false,
  grammarFocus: "",
  sessionStart: null,
  wordCount: 0,

  addMessage: (msg) =>
    set((state) => {
      const newWordCount =
        msg.role === "user"
          ? state.wordCount + msg.content.trim().split(/\s+/).length
          : state.wordCount;
      return {
        messages: [...state.messages, msg],
        wordCount: newWordCount,
      };
    }),

  updateLastAssistantMessage: (content) =>
    set((state) => {
      const msgs = [...state.messages];
      const lastIdx = msgs.length - 1;
      if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
        msgs[lastIdx] = { ...msgs[lastIdx], content };
      }
      return { messages: msgs };
    }),

  setMode: (mode) => set({ mode }),
  setConversationId: (id) => set({ conversationId: id }),
  setStreaming: (val) => set({ isStreaming: val }),
  setGrammarFocus: (focus) => set({ grammarFocus: focus }),

  startSession: () => set({ sessionStart: Date.now() }),

  getSessionDuration: () => {
    const start = get().sessionStart;
    if (!start) return 0;
    return Math.floor((Date.now() - start) / 1000);
  },

  reset: () =>
    set({
      messages: [],
      conversationId: null,
      isStreaming: false,
      grammarFocus: "",
      sessionStart: null,
      wordCount: 0,
    }),
}));
