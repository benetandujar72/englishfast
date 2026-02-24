"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CompetencyItem {
  id: "comprension" | "interaccion" | "produccion" | "escritura";
  label: string;
  value: number;
}

interface CompetencyFocusCardProps {
  level: string;
  items: CompetencyItem[];
}

export function CompetencyFocusCard({ level, items }: CompetencyFocusCardProps) {
  return (
    <Card variant="soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">MCER competency focus ({level})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{item.label}</span>
              <span className="font-medium">{Math.round(item.value)}%</span>
            </div>
            <Progress value={item.value} tone={item.value >= 70 ? "success" : "warning"} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
