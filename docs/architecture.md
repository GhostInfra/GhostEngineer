# Architecture

## Overview

GhostEngineer is an AI-powered tool that analyzes GitHub repositories and generates architecture insights, documentation, and onboarding guides.

## System Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend   │────▶│   REST API   │────▶│   Backend   │
│  (Next.js)   │◀────│   (FastAPI)  │◀────│  Services   │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                                    ┌───────────┼───────────┐
                                    ▼           ▼           ▼
                              ┌──────────┐ ┌──────────┐ ┌──────────┐
                              │ Analyzer │ │AI Engine │ │  Utils   │
                              └──────────┘ └──────────┘ └──────────┘
```

## Components

### Backend
- **Analyzer** — Clones repos, parses structure, and extracts file contents.
- **AI Engine** — LLM-powered summarization and insight generation.
- **API** — REST endpoints exposing analysis functionality.
- **Services** — Orchestrates the end-to-end analysis pipeline.
- **Utils** — Shared utilities (logging, config, helpers).

### Frontend
- **Pages** — Next.js page routes.
- **Components** — Reusable UI components (RepoInput, ResultView).
- **Styles** — Global and component-level styles.
