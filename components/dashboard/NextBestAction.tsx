"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NextBestActionProps {
  href: string;
  title: string;
  reason: string;
  etaMinutes: number;
}

export function NextBestAction({
  href,
  title,
  reason,
  etaMinutes,
}: NextBestActionProps) {
  return (
    <Card variant="elevated">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Next best action</CardTitle>
          <Badge variant="warning">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            Adaptive
          </Badge>
        </div>
        <CardDescription>{reason}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">Estimated time: {etaMinutes} min</p>
        <Button asChild className="w-full">
          <Link href={href}>
            Start now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
