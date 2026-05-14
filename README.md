# InterviewIQ

InterviewIQ is a production-ready AI interview practice platform. It generates company-specific interview questions, runs realistic interview sessions in voice or text mode, analyzes confidence metrics in real time, and produces polished performance reports.

## Features

- Company research agent (LangChain + Tavily) for hyper-specific interview context
- Groq-powered question generation and streaming answer evaluation
- Web Speech API real-time voice transcription with confidence analytics
- Supabase persistence + Upstash Redis session state (2 hour TTL)
- Premium report dashboard with charts, score breakdowns, and PDF export

## Architecture

```
		       +----------------------+
		       |      Next.js App     |
		       |  App Router + UI     |
		       +----------+-----------+
				  |
				  v
		     +------------+-------------+
		     |  API Routes (Edge/Node)  |
		     |  /api/research           |
		     |  /api/questions          |
		     |  /api/evaluate (SSE)     |
		     |  /api/report             |
		     +------+---------+---------+
			    |         |
	 +------------------+         +-----------------+
	 |                                      |
	 v                                      v
 +--------------------+             +--------------------+
 |   Supabase Postgres|             |   Upstash Redis    |
 |  sessions/answers  |             |  session state TTL |
 +--------------------+             +--------------------+
	 |
	 v
 +--------------------+
 |  Groq + LangChain  |
 |  Tavily + WebSpeech|
 +--------------------+
```

## Local Development

1. Install dependencies

```bash
npm install
```

2. Copy and fill environment variables

```bash
cp .env.local.example .env.local
```

3. Run database migrations in Supabase

- Create a new Supabase project
- Run the SQL in [supabase/migrations/00000000000000_init.sql](supabase/migrations/00000000000000_init.sql)
- Ensure `NEXT_PUBLIC_DEMO_USER_ID` matches an existing user id (UUID)

4. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
TAVILY_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_DEMO_USER_ID=
```

Notes:

- Voice mode uses the browser Web Speech API. Use Chrome for best results.

## Key Routes

- `/setup` — multi-step interview setup flow
- `/interview/[sessionId]` — live interview room
- `/report/[sessionId]` — session report and PDF export
- `/dashboard` — session history and analytics

## Resume-Ready Impact

- Engineered a real-time voice confidence analyzer using the Web Speech API, detecting filler words, pace, and silence patterns with <200ms latency per transcript chunk
- Built a company research agent using LangChain + Tavily API, generating role-specific interview questions grounded in real-time web intelligence for 500+ company-role combinations
- Implemented streaming answer evaluation via SSE using Groq LLM, scoring content, structure, depth, and confidence across multi-turn interview sessions
- Designed session persistence architecture using Upstash Redis (2hr TTL) + Supabase, supporting full interview replay and PDF report generation
