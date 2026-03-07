# API Reference

## Endpoints

> 🚧 **Coming Soon** — API endpoints are under development.

### `POST /api/analyze`

Analyze a GitHub repository and return insights.

**Request Body:**
```json
{
  "repo_url": "https://github.com/user/repo"
}
```

**Response:**
```json
{
  "status": "success",
  "summary": "...",
  "architecture": { ... },
  "tech_stack": [ ... ],
  "onboarding_guide": "..."
}
```
