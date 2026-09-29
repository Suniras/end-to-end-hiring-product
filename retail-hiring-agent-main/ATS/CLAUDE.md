# AI Agent-First Hiring System (ATS)

## Project Overview
An AI agent-first hiring system built as a multi-tenant SaaS product. Agents scan profile databases, score resumes against role criteria, run conversational pre-screens, and auto-schedule interviews.

## Current Phase: Product Definition
We are in the PRD and research phase — no code yet. Focus on product requirements before implementation.

## Directory Structure

```
ATS/
├── CLAUDE.md
├── docs/
│   ├── prd/                  # Product Requirements Documents
│   ├── research/             # Market research, competitive analysis, tech landscape
│   ├── user-stories/         # User personas, jobs-to-be-done, user flows
│   └── architecture/         # Technical architecture docs (after PRD is finalized)
```

## Competitors & Landscape
- **Traditional:** Workday, Greenhouse, Eightfold, Phenom, Paradox (Olivia), Workable
- **AI Startups:** Mercor, Tezi, Findem, HeyMilo, Maki People

## Working Rules
- **Be a critical partner, not a yes-man.** When Anuj proposes an idea, stress-test it first — surface counterarguments, risks, and reasons it might fail BEFORE agreeing or building on it. Never validate an idea just because it sounds interesting. Say "here's why this might not work" before "here's how to do it."
- **Separate vision from execution scope.** If an idea has long-term merit but doesn't belong in the current phase, say so clearly. Don't let future possibilities dilute present focus.
- **Default to skepticism on scope expansion.** Any feature or direction that targets a different buyer, market, or persona than our core (HR/TA teams hiring humans) needs to clear a high bar before being taken seriously.

## Key Decisions Made
- **Tech stack:** Python + FastAPI backend, React/Next.js frontend, PostgreSQL + pgvector
- **First module:** Sourcing + Scoring
- **Target:** Multi-tenant SaaS product
