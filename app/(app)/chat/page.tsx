"use client";

import { ChatInterface } from "@/components/chat/ChatInterface";
import { SessionFlowHeader } from "@/components/learning/SessionFlowHeader";

export default function ChatPage() {
  return (
    <div className="container mx-auto h-full max-w-6xl space-y-4 p-4">
      <SessionFlowHeader
        title="Conversation practice"
        subtitle="Short, focused chat turns with immediate corrective feedback."
        goalMinutes={12}
        doneMinutes={0}
        status="ready"
      />
      <div className="h-[calc(100vh-16rem)] rounded-2xl border bg-card/80">
        <ChatInterface />
      </div>
    </div>
  );
}
