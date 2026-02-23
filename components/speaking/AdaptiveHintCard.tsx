"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AdaptiveHintCardProps {
  focusSkill: string;
  nextMode: string;
  nextLevel: string;
  rationale: string;
}

export function AdaptiveHintCard({
  focusSkill,
  nextMode,
  nextLevel,
  rationale,
}: AdaptiveHintCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Adaptive next step</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Focus: {focusSkill}</Badge>
          <Badge variant="outline">Mode: {nextMode}</Badge>
          <Badge variant="outline">Level: {nextLevel}</Badge>
        </div>
        <p className="text-muted-foreground">{rationale}</p>
      </CardContent>
    </Card>
  );
}
