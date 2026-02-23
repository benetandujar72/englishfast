"use client";

import { cn } from "@/lib/utils";

interface CorrectionBlockProps {
  correctionsText: string;
  className?: string;
}

interface ParsedCorrection {
  original: string;
  correction: string;
  explanation: string;
}

function parseCorrections(text: string): ParsedCorrection[] {
  const corrections: ParsedCorrection[] = [];
  const lines = text.split("\n").filter((l) => l.trim());

  for (const line of lines) {
    // Match pattern: ❌ "original" → ✅ "correction" (explanation)
    const match = line.match(
      /❌\s*"([^"]+)"\s*→\s*✅\s*"([^"]+)"\s*\(([^)]+)\)/
    );
    if (match) {
      corrections.push({
        original: match[1],
        correction: match[2],
        explanation: match[3],
      });
      continue;
    }

    // Alternative pattern: - "original" -> "correction" (explanation)
    const altMatch = line.match(
      /[-•]\s*"([^"]+)"\s*(?:->|→)\s*"([^"]+)"\s*\(([^)]+)\)/
    );
    if (altMatch) {
      corrections.push({
        original: altMatch[1],
        correction: altMatch[2],
        explanation: altMatch[3],
      });
    }
  }

  return corrections;
}

export function CorrectionBlock({ correctionsText, className }: CorrectionBlockProps) {
  const corrections = parseCorrections(correctionsText);

  if (corrections.length === 0) return null;

  return (
    <div
      className={cn(
        "mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30",
        className
      )}
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
        Corrections
      </p>
      <div className="space-y-2">
        {corrections.map((c, i) => (
          <div key={i} className="text-sm">
            <span className="text-red-600 line-through dark:text-red-400">
              {c.original}
            </span>
            <span className="mx-2 text-muted-foreground">→</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {c.correction}
            </span>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {c.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
