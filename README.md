# Tales of the Valiant — Character Sheet App

A beautiful, interactive character sheet web application for the **Tales of the Valiant RPG** (Black Flag Roleplaying system by Kobold Press).

## Features

- **7-step animated character creation wizard**
  - Lineage & Heritage selection (with 3D tilt cards)
  - Class selection (all 13 ToV classes)
  - Background selection with skill proficiency choices
  - Point Buy OR Standard Array ability score assignment (live preview)
  - Talent selection (per-background choices)
  - Story & personality fields
  - Final review & character creation
- **Interactive character sheet**
  - All 6 ability scores with auto-calculated modifiers
  - Saving throws with proficiency indicators
  - Full 18-skill list with proficiency/expertise tracking
  - Live HP editing with quick +5/−5 buttons
  - Luck point tracker (click to toggle)
  - Spellcasting section (for caster classes)
  - Attacks table, treasure tracker
- **Accurate BFRD rules** — Point buy costs, standard array, Luck mechanic, all from the official Black Flag Reference Document
- **Dark fantasy design** — deep purples, Nuaibria gold, Framer Motion animations
- **Mobile responsive**

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion |
| Backend | Go + Chi router + pgx/v5 |
| Database | PostgreSQL 16 |
| Orchestration | Podman Compose |

## Quick Start

### Prerequisites
- Podman + podman-compose

### Run everything
```bash
podman compose up -d --build
```

### Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Health check**: http://localhost:8080/api/health

## Development

```bash
# Start the database
podman compose up -d db

# Backend (requires DB running)
cd backend
go run .

# Frontend
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## API Endpoints

```
GET    /api/health
GET    /api/characters
POST   /api/characters
GET    /api/characters/:id
PATCH  /api/characters/:id
DELETE /api/characters/:id
GET    /api/rules/classes
GET    /api/rules/lineages
GET    /api/rules/heritages
GET    /api/rules/backgrounds
```

## License

Game rules based on the [Black Flag Reference Document](https://koboldpress.com/black-flag-roleplaying/) by Kobold Press, licensed under Creative Commons.
