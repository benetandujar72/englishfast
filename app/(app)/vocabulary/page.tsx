"use client";

import { useState } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlashCard } from "@/components/vocabulary/FlashCard";
import { VocabQuiz } from "@/components/vocabulary/VocabQuiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function VocabularyPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const { data: dueCards } = useQuery(
    trpc.vocabulary.getDueCards.queryOptions({ limit: 20 })
  );
  const { data: stats } = useQuery(trpc.vocabulary.getStats.queryOptions());
  const { data: searchResults } = useQuery(
    trpc.vocabulary.search.queryOptions(
      { query: searchQuery, limit: 20 },
      { enabled: searchQuery.length >= 2 }
    )
  );

  const reviewMutation = useMutation(
    trpc.vocabulary.review.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
        setCurrentCardIndex((prev) => prev + 1);
      },
    })
  );

  const currentCard = dueCards?.[currentCardIndex];

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vocabulary</h1>
        {stats && (
          <div className="flex gap-2">
            <Badge variant="outline">{stats.total} total</Badge>
            <Badge variant="secondary">{stats.dueToday} due today</Badge>
            <Badge>{stats.mastered} mastered</Badge>
          </div>
        )}
      </div>

      <Tabs defaultValue="review">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="review">
            Review ({stats?.dueToday ?? 0})
          </TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="browse">Browse</TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="mt-4">
          {currentCard ? (
            <div className="mx-auto max-w-md">
              <p className="mb-4 text-center text-sm text-muted-foreground">
                Card {currentCardIndex + 1} of {dueCards?.length ?? 0}
              </p>
              <FlashCard
                word={currentCard.word}
                definition={currentCard.definition}
                exampleSent={currentCard.exampleSent}
                translation={currentCard.translation}
                category={currentCard.category}
                onRate={(quality) =>
                  reviewMutation.mutate({
                    wordId: currentCard.id,
                    quality,
                  })
                }
              />
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-lg font-medium">
                  {(dueCards?.length ?? 0) === 0 && currentCardIndex === 0
                    ? "No cards due for review!"
                    : "All done for now!"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Come back later for more reviews.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quiz" className="mt-4">
          {dueCards && dueCards.length >= 4 ? (
            <VocabQuiz
              words={dueCards.slice(0, 10).map((w) => ({
                id: w.id,
                word: w.word,
                definition: w.definition,
                exampleSent: w.exampleSent,
              }))}
              mode="definition-to-word"
              onResult={(wordId, correct) => {
                reviewMutation.mutate({
                  wordId,
                  quality: correct ? 4 : 1,
                });
              }}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p>You need at least 4 due words to start a quiz.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="browse" className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vocabulary..."
              className="pl-10"
            />
          </div>

          {searchResults && searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((word) => (
                <Card key={word.id}>
                  <CardContent className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{word.word}</p>
                      <p className="text-sm text-muted-foreground">
                        {word.definition}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {word.category && (
                        <Badge variant="outline" className="text-xs">
                          {word.category}
                        </Badge>
                      )}
                      {word.mastered && <Badge>Mastered</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
