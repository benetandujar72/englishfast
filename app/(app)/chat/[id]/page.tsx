"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { SessionFlowHeader } from "@/components/learning/SessionFlowHeader";
import { useChatStore } from "@/lib/stores/chat-store";
import { trpc } from "@/lib/trpc/client";
import type { ChatMessage } from "@/types";

export default function ChatConversationPage() {
  const params = useParams<{ id: string }>();
  const { setConversationId, addMessage, reset } = useChatStore();

  const { data: conversation } = trpc.conversation.getById.useQuery({ id: params.id });

  useEffect(() => {
    if (conversation) {
      reset();
      setConversationId(conversation.id);
      const msgs = conversation.messages as unknown as ChatMessage[];
      if (Array.isArray(msgs)) {
        msgs.forEach((m) => addMessage(m));
      }
    }
  }, [conversation, setConversationId, addMessage, reset]);

  return (
    <div className="container mx-auto h-full max-w-6xl space-y-4 p-4">
      <SessionFlowHeader
        title="Conversation practice"
        subtitle="Resume this conversation and close with a clear improvement point."
        goalMinutes={12}
        doneMinutes={0}
        status="active"
      />
      <div className="h-[calc(100vh-16rem)] rounded-2xl border bg-card/80">
        <ChatInterface />
      </div>
    </div>
  );
}
