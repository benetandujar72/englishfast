"use client";

import { cn } from "@/lib/utils";

interface CorrectionDiffProps {
  original: string;
  corrected: string;
}

interface DiffSegment {
  type: "same" | "removed" | "added";
  text: string;
}

function computeWordDiff(original: string, corrected: string): DiffSegment[] {
  const origWords = original.split(/(\s+)/);
  const corrWords = corrected.split(/(\s+)/);
  const segments: DiffSegment[] = [];

  let i = 0;
  let j = 0;

  while (i < origWords.length && j < corrWords.length) {
    if (origWords[i] === corrWords[j]) {
      segments.push({ type: "same", text: origWords[i] });
      i++;
      j++;
    } else {
      // Look ahead to find a match
      let foundOrig = -1;
      let foundCorr = -1;

      for (let k = j + 1; k < Math.min(j + 5, corrWords.length); k++) {
        if (origWords[i] === corrWords[k]) {
          foundCorr = k;
          break;
        }
      }

      for (let k = i + 1; k < Math.min(i + 5, origWords.length); k++) {
        if (origWords[k] === corrWords[j]) {
          foundOrig = k;
          break;
        }
      }

      if (foundCorr !== -1 && (foundOrig === -1 || foundCorr - j <= foundOrig - i)) {
        // Words were added
        for (let k = j; k < foundCorr; k++) {
          segments.push({ type: "added", text: corrWords[k] });
        }
        j = foundCorr;
      } else if (foundOrig !== -1) {
        // Words were removed
        for (let k = i; k < foundOrig; k++) {
          segments.push({ type: "removed", text: origWords[k] });
        }
        i = foundOrig;
      } else {
        segments.push({ type: "removed", text: origWords[i] });
        segments.push({ type: "added", text: corrWords[j] });
        i++;
        j++;
      }
    }
  }

  while (i < origWords.length) {
    segments.push({ type: "removed", text: origWords[i] });
    i++;
  }
  while (j < corrWords.length) {
    segments.push({ type: "added", text: corrWords[j] });
    j++;
  }

  return segments;
}

export function CorrectionDiff({ original, corrected }: CorrectionDiffProps) {
  const diff = computeWordDiff(original, corrected);

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-3 text-sm font-semibold">Corrected Version</h3>
      <div className="text-sm leading-relaxed">
        {diff.map((segment, i) => (
          <span
            key={i}
            className={cn(
              segment.type === "removed" &&
                "bg-red-100 text-red-700 line-through dark:bg-red-950 dark:text-red-400",
              segment.type === "added" &&
                "bg-green-100 text-green-700 font-medium dark:bg-green-950 dark:text-green-400"
            )}
          >
            {segment.text}
          </span>
        ))}
      </div>
    </div>
  );
}
