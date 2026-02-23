"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ChatInterface } from "@/components/chat/ChatInterface";
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
    <div className="h-full">
      <ChatInterface />
    </div>
  );
}
