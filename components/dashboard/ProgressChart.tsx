"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ProgressChartProps {
  data: Array<{
    date: string;
    minutesPracticed: number;
    wordsProduced: number;
  }>;
  totalMinutes: number;
  totalWords: number;
}

export function ProgressChart({
  data,
  totalMinutes,
  totalWords,
}: ProgressChartProps) {
  const chartData = data.map((d) => ({
    day: new Date(d.date).toLocaleDateString("en", { weekday: "short" }),
    minutes: d.minutesPracticed,
    words: d.wordsProduced,
  }));

  return (
    <Card variant="soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">This Week</CardTitle>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">{totalMinutes}</strong> minutes
          </span>
          <span>
            <strong className="text-foreground">{totalWords}</strong> words
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="day"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis className="text-xs" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar
              dataKey="minutes"
              fill="hsl(var(--chart-2))"
              radius={[4, 4, 0, 0]}
              name="Minutes"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
