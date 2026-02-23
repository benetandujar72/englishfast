"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function SpeakingPage() {
  const { data, isLoading } = trpc.speaking.listSessions.useQuery({ limit: 20 });

  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Speaking Coach</h1>
          <p className="text-sm text-muted-foreground">
            Practice speaking with adaptive feedback for A1-B1.
          </p>
        </div>
        <Link href="/speaking/practice">
          <Button>Start Practice</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && (
            <>
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </>
          )}

          {!isLoading && (data?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground">
              No speaking sessions yet. Start your first guided practice.
            </p>
          )}

          {(data ?? []).map((session) => (
            <div
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
            >
              <div className="space-y-1">
                <p className="font-medium">{session.topic ?? "General speaking practice"}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{new Date(session.createdAt).toLocaleString()}</span>
                  <span>•</span>
                  <span>{session.attempts.length} attempt(s)</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{session.mode}</Badge>
                <Badge variant="outline">{session.targetLevel}</Badge>
                {typeof session.averageScore === "number" && (
                  <Badge>Score {Math.round(session.averageScore)}</Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
