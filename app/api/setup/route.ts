import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // Create enums
    await db.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "ConvMode" AS ENUM ('CHAT', 'ROLEPLAY', 'DEBATE', 'INTERVIEW', 'STORYTELLING');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    results.push("ConvMode enum created");

    await db.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "ErrorType" AS ENUM ('GRAMMAR', 'VOCABULARY', 'SPELLING', 'PREPOSITION', 'ARTICLE', 'TENSE', 'WORD_ORDER', 'COLLOCATION', 'FALSE_FRIEND', 'PRONUNCIATION');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    results.push("ErrorType enum created");

    await db.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "ExamType" AS ENUM ('USE_OF_ENGLISH', 'READING', 'WRITING', 'LISTENING_TRANSCRIPT', 'SPEAKING_PROMPT');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    results.push("ExamType enum created");

    // Create tables
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "emailVerified" TIMESTAMP(3),
        "name" TEXT,
        "image" TEXT,
        "nativeLanguage" TEXT NOT NULL DEFAULT 'es',
        "targetLevel" TEXT NOT NULL DEFAULT 'B2',
        "examTarget" TEXT NOT NULL DEFAULT 'Cambridge First',
        "currentLevel" TEXT NOT NULL DEFAULT 'A2',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `);
    results.push("users table created");

    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");`);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "accounts" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
      );
    `);
    results.push("accounts table created");

    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");`);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "verification_tokens" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL
      );
    `);
    results.push("verification_tokens table created");

    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_token_key" ON "verification_tokens"("token");`);
    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");`);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "sessionToken" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
      );
    `);
    results.push("sessions table created");

    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionToken_key" ON "sessions"("sessionToken");`);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "conversations" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "title" TEXT,
        "topic" TEXT,
        "mode" "ConvMode" NOT NULL DEFAULT 'CHAT',
        "messages" JSONB NOT NULL,
        "duration" INTEGER,
        "wordCount" INTEGER,
        "level" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
      );
    `);
    results.push("conversations table created");

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "diary_entries" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "originalText" TEXT NOT NULL,
        "correctedText" TEXT,
        "feedback" JSONB,
        "wordCount" INTEGER,
        "topic" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "diary_entries_pkey" PRIMARY KEY ("id")
      );
    `);
    results.push("diary_entries table created");

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "error_records" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "conversationId" TEXT,
        "errorType" "ErrorType" NOT NULL,
        "originalText" TEXT NOT NULL,
        "correction" TEXT NOT NULL,
        "explanation" TEXT NOT NULL,
        "grammarPoint" TEXT,
        "frequency" INTEGER NOT NULL DEFAULT 1,
        "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "mastered" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "error_records_pkey" PRIMARY KEY ("id")
      );
    `);
    results.push("error_records table created");

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "daily_progress" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "date" DATE NOT NULL,
        "minutesPracticed" INTEGER NOT NULL DEFAULT 0,
        "wordsProduced" INTEGER NOT NULL DEFAULT 0,
        "errorsCount" INTEGER NOT NULL DEFAULT 0,
        "correctionsCount" INTEGER NOT NULL DEFAULT 0,
        "conversationCount" INTEGER NOT NULL DEFAULT 0,
        "diaryWords" INTEGER NOT NULL DEFAULT 0,
        "examScore" DOUBLE PRECISION,
        "estimatedLevel" TEXT,
        "xpEarned" INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "daily_progress_pkey" PRIMARY KEY ("id")
      );
    `);
    results.push("daily_progress table created");

    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "daily_progress_userId_date_key" ON "daily_progress"("userId", "date");`);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "vocabulary_items" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "word" TEXT NOT NULL,
        "definition" TEXT NOT NULL,
        "exampleSent" TEXT NOT NULL,
        "translation" TEXT,
        "category" TEXT,
        "difficulty" INTEGER NOT NULL DEFAULT 3,
        "timesReviewed" INTEGER NOT NULL DEFAULT 0,
        "timesCorrect" INTEGER NOT NULL DEFAULT 0,
        "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
        "interval" INTEGER NOT NULL DEFAULT 0,
        "repetitions" INTEGER NOT NULL DEFAULT 0,
        "nextReview" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "mastered" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "vocabulary_items_pkey" PRIMARY KEY ("id")
      );
    `);
    results.push("vocabulary_items table created");

    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "vocabulary_items_userId_word_key" ON "vocabulary_items"("userId", "word");`);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "exam_attempts" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "examType" "ExamType" NOT NULL,
        "part" TEXT NOT NULL,
        "content" JSONB NOT NULL,
        "score" DOUBLE PRECISION,
        "feedback" TEXT,
        "timeSpent" INTEGER,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
      );
    `);
    results.push("exam_attempts table created");

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "streaks" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "currentDays" INTEGER NOT NULL DEFAULT 0,
        "longestDays" INTEGER NOT NULL DEFAULT 0,
        "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "totalDays" INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "streaks_pkey" PRIMARY KEY ("id")
      );
    `);
    results.push("streaks table created");

    await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "streaks_userId_key" ON "streaks"("userId");`);

    // Foreign keys (with IF NOT EXISTS equivalent)
    const fkeys = [
      { name: "accounts_userId_fkey", sql: `ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
      { name: "sessions_userId_fkey", sql: `ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
      { name: "conversations_userId_fkey", sql: `ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
      { name: "diary_entries_userId_fkey", sql: `ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
      { name: "error_records_userId_fkey", sql: `ALTER TABLE "error_records" ADD CONSTRAINT "error_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
      { name: "error_records_conversationId_fkey", sql: `ALTER TABLE "error_records" ADD CONSTRAINT "error_records_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE` },
      { name: "daily_progress_userId_fkey", sql: `ALTER TABLE "daily_progress" ADD CONSTRAINT "daily_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
      { name: "vocabulary_items_userId_fkey", sql: `ALTER TABLE "vocabulary_items" ADD CONSTRAINT "vocabulary_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
      { name: "exam_attempts_userId_fkey", sql: `ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
      { name: "streaks_userId_fkey", sql: `ALTER TABLE "streaks" ADD CONSTRAINT "streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
    ];

    for (const fk of fkeys) {
      try {
        await db.$executeRawUnsafe(fk.sql);
        results.push(`FK ${fk.name} created`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("already exists")) {
          results.push(`FK ${fk.name} already exists`);
        } else {
          results.push(`FK ${fk.name} error: ${msg}`);
        }
      }
    }

    // Mark Prisma migrations as applied
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" VARCHAR(36) NOT NULL,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMPTZ,
        "migration_name" VARCHAR(255) NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMPTZ,
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
      );
    `);
    results.push("_prisma_migrations table created");

    return NextResponse.json({ success: true, results });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, results, error: msg }, { status: 500 });
  }
}
