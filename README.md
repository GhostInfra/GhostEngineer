# 👻 GhostEngineer

AI-powered tool that analyzes GitHub repositories and generates architecture insights, documentation, and onboarding guides.

## Project Structure

```
ghostengineer/
├── README.md
├── LICENSE
├── .gitignore
├── requirements.txt
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── roadmap.md
│
├── backend/
│   ├── main.py
│   ├── analyzer/
│   │   ├── repo_cloner.py
│   │   ├── structure_parser.py
│   │   └── file_extractor.py
│   ├── ai_engine/
│   │   ├── summarizer.py
│   │   └── prompts.py
│   ├── api/
│   │   ├── routes/
│   │   └── controllers/
│   ├── services/
│   │   └── analysis_service.py
│   └── utils/
│       └── logger.py
│
├── frontend/
│   ├── pages/
│   │   └── index.tsx
│   ├── components/
│   │   ├── RepoInput.tsx
│   │   └── ResultView.tsx
│   └── styles/
│
├── scripts/
│   └── setup.sh
│
└── tests/
    ├── backend/
    └── frontend/
```

## Tech Stack

| Layer    | Technology       |
|----------|-----------------|
| Backend  | Python, FastAPI  |
| AI       | Gemini / OpenAI  |
| Frontend | Next.js, React   |
| Styling  | CSS              |

## Analysis Pipeline

1.  **Repo Cloner**: Shallow clones repositories to unique temporary directories.
2.  **Structure Parser**: Recursively generates a project tree while ignoring noise (`node_modules`, `.git`, etc.).
3.  **File Extractor**: Extracts source code content for AI processing.
    - ⚡ **Performance Note**: To ensure stability and speed, there is a **50KB per-file limit**. Files larger than this are skipped to optimize AI context usage and processing time.
4.  **AI Engine**: (In Progress) Generates human-readable architectural insights and summaries.

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Rajkoli145/GhostEngineer.git
cd GhostEngineer

# Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

## Documentation

- [Architecture](docs/architecture.md) — System design and component overview
- [API Reference](docs/api.md) — REST API endpoint documentation
- [Roadmap](docs/roadmap.md) — Development phases and milestones

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
