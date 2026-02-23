# RFC-001: English Immersion AI App — Production Specification

**Versión:** 1.0.0  
**Fecha:** 2026-02-23  
**Autor:** Benet (EDUTAC)  
**Estado:** DRAFT → READY FOR IMPLEMENTATION  
**Objetivo:** App web PWA de inmersión total en inglés orientada al Cambridge First Certificate (B2), con tutor IA personalizado, feedback en tiempo real y seguimiento de progreso.

---

## 1. RESUMEN EJECUTIVO

Aplicación web progresiva (PWA) que actúa como tutor de inglés 24/7 usando la API de Claude (Anthropic). Cubre los 4 pilares del aprendizaje B2: conversación, escritura, gramática y vocabulario. Diseñada para un usuario adulto hispanohablante con inmersión intensiva (4-6h/día). Desplegada en producción con arquitectura serverless escalable.

---

## 2. STACK TECNOLÓGICO

### 2.1 Frontend
```
Framework:       Next.js 14 (App Router)
Lenguaje:        TypeScript 5.x
UI Components:   shadcn/ui + Radix UI
Estilos:         Tailwind CSS 3.x
Estado global:   Zustand
Estado servidor: TanStack Query v5
Voz (STT/TTS):   Web Speech API (nativo) + ElevenLabs API (opcional, calidad alta)
PWA:             next-pwa (Workbox)
Gráficos:        Recharts
Animaciones:     Framer Motion
Testing:         Vitest + Playwright
```

### 2.2 Backend
```
Runtime:         Node.js 20 LTS
Framework:       Next.js API Routes (serverless) + tRPC v11
Lenguaje:        TypeScript 5.x
IA principal:    Anthropic Claude API (claude-opus-4-6 / claude-sonnet-4-5)
Auth:            NextAuth.js v5 (credentials + Google OAuth)
Validación:      Zod
Rate limiting:   Upstash Redis + @upstash/ratelimit
Jobs/Cron:       Vercel Cron Jobs
Email:           Resend
```

### 2.3 Base de Datos
```
Principal:       PostgreSQL 16 (Supabase)
ORM:             Prisma 5.x
Cache/Sessions:  Redis (Upstash)
Embeddings:      pgvector (extensión Postgres para RAG futuro)
Backup:          Supabase automático (daily)
```

### 2.4 Infraestructura & DevOps
```
Hosting:         Vercel (frontend + API routes)
Base de datos:   Supabase (managed PostgreSQL)
CDN:             Vercel Edge Network
CI/CD:           GitHub Actions
Variables env:   Vercel Environment Variables
Monitoring:      Vercel Analytics + Sentry
Logs:            Axiom
Dominio:         Vercel Domains o custom
```

### 2.5 Herramientas de desarrollo
```
IDE:             Cursor IDE (recomendado)
Versionado:      Git + GitHub
Package manager: pnpm 8.x
Linting:         ESLint + Prettier
Commits:         Conventional Commits + Husky
```

---

## 3. ARQUITECTURA DEL SISTEMA

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (PWA)                         │
│  Next.js 14 · TypeScript · Tailwind · shadcn/ui         │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Chat/   │ │ Diario   │ │  Examen  │ │Dashboard │   │
│  │Speaking  │ │Writing   │ │  First   │ │Progreso  │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │
│       └────────────┴────────────┴────────────┘          │
│                         │ tRPC                           │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┼───────────────────────────────┐
│                  API LAYER (Vercel)                      │
│                                                          │
│  NextAuth.js ──► Middleware de autenticación             │
│  tRPC Router ──► Validación Zod ──► Handlers            │
│  Rate Limiter ──► Upstash Redis                          │
│                         │                               │
│         ┌───────────────┼───────────────┐               │
│         ▼               ▼               ▼               │
│   Claude API      Prisma ORM       Web Speech           │
│   (Anthropic)    (PostgreSQL)      / ElevenLabs         │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│                  DATOS (Supabase)                        │
│                                                          │
│  PostgreSQL 16 + pgvector                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Users   │ │Sessions  │ │ Entries  │ │  Errors  │   │
│  │  Profiles│ │Conversations│ │(Diario)│ │Recurrents│   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐                              │
│  │ Progress │ │Vocabulary│                              │
│  │  Stats   │ │  Items   │                              │
│  └──────────┘ └──────────┘                              │
└─────────────────────────────────────────────────────────┘
```

---

## 4. ESQUEMA DE BASE DE DATOS (Prisma Schema)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  nativeLanguage String   @default("es")
  targetLevel   String    @default("B2")
  examTarget    String    @default("Cambridge First")
  currentLevel  String    @default("A2")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions      Session[]
  conversations Conversation[]
  diaryEntries  DiaryEntry[]
  errorLog      ErrorRecord[]
  progress      DailyProgress[]
  vocabulary    VocabularyItem[]
  examAttempts  ExamAttempt[]
  streak        Streak?

  @@map("users")
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  sessionToken String   @unique
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Conversation {
  id        String    @id @default(cuid())
  userId    String
  title     String?
  topic     String?
  mode      ConvMode  @default(CHAT)
  messages  Json      // Array of {role, content, timestamp, corrections?}
  duration  Int?      // segundos
  wordCount Int?
  level     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  errors    ErrorRecord[]

  @@map("conversations")
}

enum ConvMode {
  CHAT
  ROLEPLAY
  DEBATE
  INTERVIEW
  STORYTELLING
}

model DiaryEntry {
  id          String   @id @default(cuid())
  userId      String
  originalText String
  correctedText String?
  feedback    Json?    // {errors: [], suggestions: [], score: number, level: string}
  wordCount   Int?
  topic       String?
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("diary_entries")
}

model ErrorRecord {
  id             String   @id @default(cuid())
  userId         String
  conversationId String?
  errorType      ErrorType
  originalText   String
  correction     String
  explanation    String
  grammarPoint   String?  // "conditional type 2", "reported speech"...
  frequency      Int      @default(1)
  lastSeen       DateTime @default(now())
  mastered       Boolean  @default(false)
  createdAt      DateTime @default(now())

  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  conversation   Conversation? @relation(fields: [conversationId], references: [id])

  @@map("error_records")
}

enum ErrorType {
  GRAMMAR
  VOCABULARY
  SPELLING
  PREPOSITION
  ARTICLE
  TENSE
  WORD_ORDER
  COLLOCATION
  FALSE_FRIEND
  PRONUNCIATION
}

model DailyProgress {
  id              String   @id @default(cuid())
  userId          String
  date            DateTime @db.Date
  minutesPracticed Int     @default(0)
  wordsProduced   Int      @default(0)
  errorsCount     Int      @default(0)
  correctionsCount Int     @default(0)
  conversationCount Int    @default(0)
  diaryWords      Int      @default(0)
  examScore       Float?
  estimatedLevel  String?
  xpEarned        Int      @default(0)

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@map("daily_progress")
}

model VocabularyItem {
  id           String   @id @default(cuid())
  userId       String
  word         String
  definition   String
  exampleSent  String
  translation  String?
  category     String?  // "FCE Vocabulary", "Business", "Academic"...
  difficulty   Int      @default(3) // 1-5
  timesReviewed Int     @default(0)
  timesCorrect  Int     @default(0)
  nextReview   DateTime @default(now())
  mastered     Boolean  @default(false)
  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, word])
  @@map("vocabulary_items")
}

model ExamAttempt {
  id         String   @id @default(cuid())
  userId     String
  examType   ExamType
  part       String   // "Use of English Part 1", "Writing Part 2"...
  content    Json     // pregunta + respuesta + corrección
  score      Float?   // 0-100
  feedback   String?
  timeSpent  Int?     // segundos
  createdAt  DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("exam_attempts")
}

enum ExamType {
  USE_OF_ENGLISH
  READING
  WRITING
  LISTENING_TRANSCRIPT
  SPEAKING_PROMPT
}

model Streak {
  id           String   @id @default(cuid())
  userId       String   @unique
  currentDays  Int      @default(0)
  longestDays  Int      @default(0)
  lastActivity DateTime @default(now())
  totalDays    Int      @default(0)

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("streaks")
}
```

---

## 5. MÓDULOS DE LA APLICACIÓN

### 5.1 Módulo: Chat / Speaking (Core)

**Ruta:** `/app/chat`

**Funcionalidad:**
- Chat en tiempo real con Claude como tutor B2
- Modos: libre, roleplay, debate, entrevista de trabajo, storytelling
- Corrección inline: Claude responde en inglés Y al final de cada mensaje añade `[CORRECTIONS]` si hay errores
- Voice input: Web Speech API (STT) → texto → Claude → respuesta → TTS
- Contador de tiempo, palabras producidas
- Guardar conversación con resumen automático

**System prompt base (configurable):**
```
You are an expert Cambridge First (B2) English tutor for Benet, 
a 54-year-old Spanish/Catalan speaker with {currentLevel} level.

RULES:
1. Always respond naturally in English, maintaining conversation flow
2. At the end of EVERY message, add a [CORRECTIONS] block IF there were errors:
   [CORRECTIONS]
   ❌ "{original}" → ✅ "{correction}" ({brief explanation})
3. Keep corrections to max 3 per message (most important ones)
4. Adapt vocabulary to B2 level
5. Current topic/mode: {mode}
6. Encourage and keep conversation engaging

Today's focus: {grammarFocus}
Session goal: {sessionGoal}
```

**API Route:** `POST /api/trpc/conversation.chat`
```typescript
// Input
{
  messages: ChatMessage[]
  mode: ConvMode
  grammarFocus?: string
  conversationId?: string
}
// Output: StreamingResponse (SSE)
```

---

### 5.2 Módulo: Diario (Writing)

**Ruta:** `/app/diary`

**Funcionalidad:**
- Editor de texto libre en inglés (mínimo 100 palabras/día)
- Al enviar: Claude analiza y devuelve:
  - Texto corregido con cambios marcados (diff visual)
  - Score B1/B2/B3 estimado
  - Top 5 errores con explicación
  - Sugerencias de vocabulario más avanzado
  - Reescritura de 1 párrafo en nivel C1 (aspiracional)
- Historial de entradas con progreso visible

**Prompt de corrección:**
```
Analyze this English diary entry written by a B1-B2 Spanish learner 
targeting Cambridge First.

Return JSON with this exact structure:
{
  "correctedText": "...",
  "estimatedLevel": "B1|B1+|B2|B2+",
  "overallScore": 0-100,
  "errors": [
    {
      "original": "...",
      "correction": "...",
      "explanation": "...",
      "type": "grammar|vocabulary|spelling|..."
    }
  ],
  "vocabularyUpgrades": [
    {"basic": "...", "advanced": "...", "context": "..."}
  ],
  "positiveFeedback": "...",
  "c1Rewrite": "...(one paragraph rewritten at C1 level)"
}
```

---

### 5.3 Módulo: Examen First (Practice)

**Ruta:** `/app/exam`

**Partes implementadas:**

**Use of English:**
- Part 1: Multiple choice cloze (15 preguntas)
- Part 2: Open cloze (8 gaps)
- Part 3: Word formation (8 words)
- Part 4: Key word transformations (6 sentences)

**Writing:**
- Part 1: Essay (argumentative, 140-190 words)
- Part 2: Artículo, carta, reseña, informe

**Reading:**
- Part 5: Multiple choice (6 questions)
- Part 6: Gapped text
- Part 7: Multiple matching

**Generación de ejercicios:** Claude genera ejercicios nuevos cada vez, calibrados al nivel actual del usuario. Nunca el mismo ejercicio dos veces.

**Sistema de puntuación:** Escala Cambridge 0-100, con banda de nivel (A2/B1/B1+/B2/B2+/C1)

---

### 5.4 Módulo: Dashboard de Progreso

**Ruta:** `/app/dashboard`

**Widgets:**
- Racha diaria (streak) con calendario tipo GitHub
- Minutos practicados esta semana (gráfico de barras)
- Nivel estimado actual (gauge animado)
- Top errores recurrentes (tabla con frecuencia)
- Palabras aprendidas este mes
- Predicción: "A este ritmo, alcanzarás B2 en X semanas"
- Próxima sesión recomendada (basada en errores frecuentes)

---

### 5.5 Módulo: Vocabulario (Flashcards)

**Ruta:** `/app/vocabulary`

**Funcionalidad:**
- Banco de palabras FCE preinstalado (3000 palabras clave)
- Sistema de repetición espaciada (algoritmo SM-2 simplificado)
- Claude genera ejemplos contextualizados nuevos cada vez
- Añadir palabras desde conversaciones (1 click)
- Modo quiz: definición → palabra / palabra → definición / fill-the-gap

---

## 6. SISTEMA DE IA (Prompts Architecture)

### 6.1 Gestión de contexto
Cada conversación mantiene:
```typescript
interface AIContext {
  userId: string
  currentLevel: string          // del perfil del usuario
  recentErrors: ErrorRecord[]   // últimos 10 errores frecuentes
  sessionFocus: string          // gramática del día
  conversationHistory: Message[] // últimos N mensajes (ventana deslizante)
  mode: ConvMode
}
```

### 6.2 Selección de modelo
```typescript
const MODEL_STRATEGY = {
  chat: "claude-sonnet-4-5",        // velocidad para conversación fluida
  diary_correction: "claude-opus-4-6", // máxima calidad en corrección
  exam_generation: "claude-opus-4-6",  // ejercicios rigurosos
  quick_vocab: "claude-haiku-4-5",  // respuestas rápidas de vocabulario
}
```

### 6.3 Streaming
Todas las respuestas de chat usan **Server-Sent Events (SSE)** para streaming en tiempo real:
```typescript
// API Route
export async function POST(req: Request) {
  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: buildMessages(context),
    system: buildSystemPrompt(context),
  })
  return new Response(stream.toReadableStream())
}
```

---

## 7. AUTENTICACIÓN Y SEGURIDAD

```
Auth:           NextAuth.js v5
Providers:      Google OAuth + Email Magic Link (Resend)
Sesiones:       JWT + Redis cache
Rate limiting:  10 req/min conversación, 5 req/min corrección diario
API Key:        ANTHROPIC_API_KEY solo en servidor, nunca en cliente
CORS:           Configurado solo para dominio propio
Input sanitize: Zod validation en todos los endpoints
```

**Variables de entorno requeridas:**
```env
# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Auth
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Email
RESEND_API_KEY=...

# TTS opcional
ELEVENLABS_API_KEY=...

# Monitoring
SENTRY_DSN=...
```

---

## 8. ESTRUCTURA DE CARPETAS (Next.js 14)

```
english-ai-app/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx              # Sidebar + Nav
│   │   ├── dashboard/page.tsx
│   │   ├── chat/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── diary/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── exam/
│   │   │   ├── page.tsx
│   │   │   └── [type]/page.tsx
│   │   └── vocabulary/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── trpc/[trpc]/route.ts
│   ├── layout.tsx
│   └── page.tsx                    # Landing / redirect
├── components/
│   ├── ui/                         # shadcn components
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── CorrectionBlock.tsx
│   │   ├── VoiceInput.tsx
│   │   └── ModeSelector.tsx
│   ├── diary/
│   │   ├── DiaryEditor.tsx
│   │   ├── CorrectionDiff.tsx
│   │   └── FeedbackPanel.tsx
│   ├── exam/
│   │   ├── ExamSelector.tsx
│   │   ├── UseOfEnglish.tsx
│   │   ├── WritingPrompt.tsx
│   │   └── ScoreDisplay.tsx
│   ├── dashboard/
│   │   ├── StreakCalendar.tsx
│   │   ├── LevelGauge.tsx
│   │   ├── ErrorTable.tsx
│   │   └── ProgressChart.tsx
│   └── vocabulary/
│       ├── FlashCard.tsx
│       └── VocabQuiz.tsx
├── server/
│   ├── api/
│   │   ├── root.ts                 # tRPC root router
│   │   └── routers/
│   │       ├── conversation.ts
│   │       ├── diary.ts
│   │       ├── exam.ts
│   │       ├── progress.ts
│   │       └── vocabulary.ts
│   ├── ai/
│   │   ├── client.ts               # Anthropic client singleton
│   │   ├── prompts/
│   │   │   ├── chat.ts
│   │   │   ├── diary.ts
│   │   │   └── exam.ts
│   │   └── streaming.ts
│   └── db/
│       ├── index.ts                # Prisma client
│       └── queries/
├── lib/
│   ├── auth.ts
│   ├── redis.ts
│   ├── utils.ts
│   └── spaced-repetition.ts       # Algoritmo SM-2
├── hooks/
│   ├── useVoiceInput.ts
│   ├── useStreaming.ts
│   └── useProgress.ts
├── types/
│   └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                     # 3000 palabras FCE
├── public/
│   ├── manifest.json               # PWA
│   └── icons/
├── .env.example
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 9. PWA CONFIGURATION

```json
// public/manifest.json
{
  "name": "English First AI Tutor",
  "short_name": "EnglishAI",
  "description": "Tu tutor de inglés B2 con IA disponible 24h",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#3b82f6",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Service Worker:** Cache de assets estáticos, offline fallback para vocabulario y flashcards.

---

## 10. DESPLIEGUE EN PRODUCCIÓN

### 10.1 Vercel (recomendado)
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Conectar repositorio GitHub
vercel link

# 3. Configurar variables de entorno en Vercel Dashboard

# 4. Deploy
vercel --prod
```

### 10.2 Supabase Setup
```bash
# 1. Crear proyecto en supabase.com
# 2. Obtener DATABASE_URL y DIRECT_URL
# 3. Ejecutar migraciones
npx prisma migrate deploy
npx prisma db seed
```

### 10.3 CI/CD (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 11. ESTIMACIÓN DE COSTES MENSUALES (uso personal intensivo)

| Servicio | Plan | Coste/mes |
|---|---|---|
| Vercel | Hobby (gratis) o Pro | 0€ - 20€ |
| Supabase | Free (hasta 500MB) | 0€ |
| Upstash Redis | Free tier | 0€ |
| Anthropic API | ~4-6h/día conversación | ~15-30€ |
| Resend Email | Free (3000 emails/mes) | 0€ |
| ElevenLabs TTS | Starter (30k chars/mes) | 5€ |
| **TOTAL** | | **~20-55€/mes** |

> El mayor coste es Claude API. Optimizable usando claude-sonnet para chat y reservando opus solo para correcciones.

---

## 12. ROADMAP DE DESARROLLO

### Fase 1 — MVP (Semanas 1-3)
- [ ] Setup Next.js 14 + TypeScript + Tailwind + shadcn
- [ ] Auth con NextAuth (Google)
- [ ] Schema Prisma + Supabase
- [ ] Módulo Chat básico con Claude (sin voz)
- [ ] Streaming de respuestas
- [ ] Correcciones inline en chat
- [ ] Deploy en Vercel

### Fase 2 — Core features (Semanas 4-6)
- [ ] Módulo Diario con corrección completa
- [ ] Voice input (Web Speech API)
- [ ] Dashboard básico (streak, tiempo)
- [ ] PWA manifest + service worker

### Fase 3 — Exam & Vocabulary (Semanas 7-10)
- [ ] Módulo Examen First (Use of English)
- [ ] Módulo Vocabulario con SM-2
- [ ] Dashboard completo con gráficos
- [ ] Registro de errores recurrentes

### Fase 4 — Polish & Production (Semanas 11-12)
- [ ] Optimización de prompts
- [ ] Tests E2E con Playwright
- [ ] Monitoring con Sentry
- [ ] Dominio personalizado
- [ ] Modo offline para vocabulary

---

## 13. COMANDOS DE INICIO RÁPIDO

```bash
# Crear el proyecto
pnpm create next-app@latest english-ai-app \
  --typescript \
  --tailwind \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd english-ai-app

# Instalar dependencias principales
pnpm add @anthropic-ai/sdk @trpc/server @trpc/client @trpc/next \
  @trpc/react-query @tanstack/react-query \
  next-auth @auth/prisma-adapter \
  prisma @prisma/client \
  zod zustand \
  @upstash/redis @upstash/ratelimit \
  resend \
  recharts framer-motion \
  next-pwa

# shadcn/ui
pnpm dlx shadcn@latest init

# Prisma
npx prisma init

# Variables de entorno
cp .env.example .env.local

# Desarrollo
pnpm dev
```

---

## 14. PROMPT PARA GENERAR LA APP EN CLAUDE CODE / CURSOR

Usa este prompt directamente en Claude Code o Cursor para generar la app:

```
Build a production-ready English learning PWA called "English First AI Tutor" 
using Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, tRPC, 
Prisma with PostgreSQL (Supabase), and Anthropic Claude API.

USER: Adult Spanish speaker (54yo), targeting Cambridge First Certificate (B2).
Practices 4-6 hours/day. Needs immersive English environment 24/7.

MODULES TO BUILD:
1. Chat module with Claude as B2 tutor
   - Real-time streaming responses (SSE)
   - Inline grammar corrections in [CORRECTIONS] blocks
   - Multiple modes: free chat, roleplay, debate, interview
   - Web Speech API for voice input
   - Save conversations with auto-summary

2. Diary/Writing module
   - Free writing editor (min 100 words)
   - Claude analyzes and returns: corrected text, B-level score, 
     top errors, vocabulary upgrades, C1 rewrite example
   - Visual diff between original and corrected

3. Cambridge First Exam simulator
   - Use of English: Part 1 (MCQ cloze), Part 2 (open cloze), 
     Part 3 (word formation), Part 4 (key word transformation)
   - Writing: Part 1 (essay), Part 2 (article/letter/review)
   - Claude generates NEW exercises every time, calibrated to user level
   - Cambridge 0-100 scoring with band level

4. Progress Dashboard
   - Daily streak calendar (GitHub-style)
   - Weekly practice minutes bar chart
   - Current level gauge (animated)
   - Recurring errors table with frequency
   - Level prediction: "At this pace, you'll reach B2 in X weeks"

5. Vocabulary module
   - 3000 FCE keywords pre-seeded
   - SM-2 spaced repetition algorithm
   - Claude generates fresh example sentences each time
   - 1-click add from conversations

TECH REQUIREMENTS:
- Model: claude-sonnet-4-5 for chat (speed), claude-opus-4-6 for corrections (quality)
- Streaming with Anthropic SDK stream()
- Auth: NextAuth v5 with Google OAuth
- Rate limiting: Upstash Redis (10 req/min chat, 5 req/min diary)
- PWA: offline vocabulary, installable
- Deploy target: Vercel + Supabase

DATABASE: Use the Prisma schema provided below [paste schema from section 4]

Start with:
1. Project setup and folder structure
2. Prisma schema and migrations  
3. Auth configuration
4. Chat module with streaming (this is the most critical)
5. Then remaining modules in order

Prioritize: working streaming chat > everything else.
```

---

*RFC-001 v1.0.0 — English Immersion AI App — EDUTAC / Benet*
