"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { QUALITY_LABELS } from "@/lib/spaced-repetition";

interface FlashCardProps {
  word: string;
  definition: string;
  exampleSent: string;
  translation?: string | null;
  category?: string | null;
  onRate: (quality: number) => void;
}

export function FlashCard({
  word,
  definition,
  exampleSent,
  translation,
  category,
  onRate,
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="space-y-4">
      <div
        className="perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="min-h-[250px] flex items-center justify-center">
                <CardContent className="text-center py-8">
                  {category && (
                    <p className="mb-2 text-xs text-muted-foreground uppercase tracking-wide">
                      {category}
                    </p>
                  )}
                  <p className="text-3xl font-bold">{word}</p>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Tap to reveal definition
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="min-h-[250px]">
                <CardContent className="py-6 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      Definition
                    </p>
                    <p className="text-lg">{definition}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      Example
                    </p>
                    <p className="text-sm italic">&ldquo;{exampleSent}&rdquo;</p>
                  </div>
                  {translation && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">
                        Spanish
                      </p>
                      <p className="text-sm">{translation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-2"
        >
          {[1, 2, 3, 4, 5].map((q) => (
            <Button
              key={q}
              variant="outline"
              size="sm"
              className={`text-xs ${QUALITY_LABELS[q].color}`}
              onClick={() => {
                onRate(q);
                setIsFlipped(false);
              }}
            >
              {QUALITY_LABELS[q].label}
            </Button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
