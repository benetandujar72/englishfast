"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useChatStore } from "@/lib/stores/chat-store";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import type { ChatMessage } from "@/types";

export default function ChatConversationPage() {
  const params = useParams<{ id: string }>();
  const trpc = useTRPC();
  const { setConversationId, addMessage, reset } = useChatStore();

  const { data: conversation } = useQuery(
    trpc.conversation.getById.queryOptions({ id: params.id })
  );

  useEffect(() => {
    if (conversation) {
      reset();
      setConversationId(conversation.id);
      const msgs = conversation.messages as ChatMessage[];
      if (Array.isArray(msgs)) {
        msgs.forEach((m) => addMessage(m));
      }
    }
  }, [conversation, setConversationId, addMessage, reset]);

  return (
    <div className="h-full">
      <ChatInterface />
    </div>
  );
}
