"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ErrorEntry {
  id: string;
  errorType: string;
  originalText: string;
  correction: string;
  explanation: string;
  grammarPoint: string | null;
  frequency: number;
  lastSeen: Date | string;
}

interface ErrorTableProps {
  errors: ErrorEntry[];
}

function getTypeColor(type: string) {
  const colors: Record<string, string> = {
    GRAMMAR: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    VOCABULARY: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    TENSE: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    PREPOSITION: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    ARTICLE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    SPELLING: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  };
  return colors[type] ?? "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
}

export function ErrorTable({ errors }: ErrorTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recurring Errors</CardTitle>
        <p className="text-xs text-muted-foreground">
          Most frequent mistakes to work on
        </p>
      </CardHeader>
      <CardContent>
        {errors.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No errors recorded yet. Start practicing!
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Error</TableHead>
                <TableHead>Correction</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errors.map((error) => (
                <TableRow key={error.id}>
                  <TableCell>
                    <Badge className={`text-xs ${getTypeColor(error.errorType)}`}>
                      {error.errorType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-red-600 dark:text-red-400">
                    {error.originalText}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-green-600 dark:text-green-400">
                    {error.correction}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {error.frequency}x
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
