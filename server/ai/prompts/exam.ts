import type { ExamType } from "@prisma/client";

export function buildExamGenerationPrompt(
  examType: ExamType,
  part: string,
  currentLevel: string
): string {
  const partPrompts: Record<string, string> = {
    "Use of English Part 1": `Generate a Cambridge First "Use of English Part 1" (Multiple Choice Cloze) exercise.

Return ONLY valid JSON:
{
  "title": "Use of English Part 1 - Multiple Choice Cloze",
  "instructions": "For questions 1-8, read the text below and decide which answer (A, B, C or D) best fits each gap.",
  "passage": "A short text (150-180 words) with 8 numbered gaps marked as (1), (2), etc. The topic should be interesting and varied.",
  "questions": [
    {
      "id": 1,
      "options": ["A) word1", "B) word2", "C) word3", "D) word4"],
      "answer": "B"
    }
  ]
}

Focus on testing: phrasal verbs, collocations, linking words, vocabulary that distinguishes B2 from B1.`,

    "Use of English Part 2": `Generate a Cambridge First "Use of English Part 2" (Open Cloze) exercise.

Return ONLY valid JSON:
{
  "title": "Use of English Part 2 - Open Cloze",
  "instructions": "For questions 1-8, read the text below and think of the word which best fits each gap. Use only one word in each gap.",
  "passage": "A short text (150-180 words) with 8 numbered gaps marked as (1), (2), etc.",
  "questions": [
    { "id": 1, "answer": "the" }
  ]
}

Focus on: articles, prepositions, conjunctions, auxiliary verbs, relative pronouns, quantifiers.`,

    "Use of English Part 3": `Generate a Cambridge First "Use of English Part 3" (Word Formation) exercise.

Return ONLY valid JSON:
{
  "title": "Use of English Part 3 - Word Formation",
  "instructions": "For questions 1-8, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line.",
  "passage": "A short text (150-180 words) with 8 gaps, each with a ROOT word in CAPITALS.",
  "questions": [
    { "id": 1, "rootWord": "COMPETE", "answer": "competition" }
  ]
}

Focus on: prefixes (un-, dis-, re-, over-), suffixes (-tion, -ness, -ment, -able, -ful, -less), compound forms.`,

    "Use of English Part 4": `Generate a Cambridge First "Use of English Part 4" (Key Word Transformation) exercise.

Return ONLY valid JSON:
{
  "title": "Use of English Part 4 - Key Word Transformations",
  "instructions": "For questions 1-6, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between two and five words, including the word given.",
  "questions": [
    {
      "id": 1,
      "sentence1": "The original sentence.",
      "keyword": "KEYWORD",
      "sentence2Start": "Beginning of second sentence...",
      "sentence2End": "...end of second sentence.",
      "answer": "the complete gap fill including the keyword"
    }
  ]
}

Focus on: passive voice, reported speech, conditionals, comparatives, wish/if only, phrasal verbs, modal verbs.`,

    "Writing Part 1": `Generate a Cambridge First "Writing Part 1" (Essay) prompt.

Return ONLY valid JSON:
{
  "title": "Writing Part 1 - Essay",
  "instructions": "Write an essay of 140-190 words.",
  "prompt": "A clear essay question with context. Include two ideas that were 'discussed in class' and ask the student to write about both ideas and say which they think is more important.",
  "notes": ["First idea to discuss", "Second idea to discuss"],
  "wordRange": { "min": 140, "max": 190 }
}

Topics should be relevant to B2: technology, environment, education, work, social issues, health.`,

    "Writing Part 2": `Generate a Cambridge First "Writing Part 2" prompt. Randomly choose ONE of: article, letter/email, review, or report.

Return ONLY valid JSON:
{
  "title": "Writing Part 2 - [Article/Letter/Review/Report]",
  "instructions": "Write your answer in 140-190 words in an appropriate style.",
  "type": "article|letter|review|report",
  "prompt": "The full task description including context and what to include.",
  "wordRange": { "min": 140, "max": 190 }
}`,
  };

  const prompt = partPrompts[part] ?? partPrompts["Use of English Part 1"];

  return `You are a Cambridge First Certificate (FCE) exam question creator.
The student is at ${currentLevel} level. Create exercises calibrated slightly above their current level to challenge them.

IMPORTANT: Generate COMPLETELY NEW content every time. Never repeat exercises.

${prompt}

Return ONLY the JSON object, no markdown code fences, no additional text.`;
}

export function buildExamGradingPrompt(
  examType: ExamType,
  part: string
): string {
  return `You are a Cambridge First Certificate examiner. Grade the following exam submission.

Return ONLY valid JSON:
{
  "score": <number 0-100>,
  "maxScore": <total possible points>,
  "percentage": <0-100>,
  "band": "A2|B1|B1+|B2|B2+|C1",
  "feedback": "2-3 sentences of constructive feedback",
  "corrections": [
    {
      "questionId": <number>,
      "correct": "the correct answer",
      "userAnswer": "what the student wrote",
      "explanation": "why the correct answer is right"
    }
  ]
}

CAMBRIDGE SCORING BANDS:
- 0-39%: A2
- 40-59%: B1
- 60-74%: B1+
- 75-84%: B2
- 85-94%: B2+
- 95-100%: C1

For Writing tasks, assess: Content (task completion), Communicative Achievement (appropriate register), Organisation (cohesion, paragraphing), Language (range and accuracy).

Return ONLY the JSON object, no markdown code fences, no additional text.`;
}
