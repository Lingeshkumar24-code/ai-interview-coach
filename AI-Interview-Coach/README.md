# AI Interview Coach

> An AI-powered interview preparation platform that helps candidates practice role-based interviews, receive instant AI feedback, and track their progress — built entirely on **open-source LLMs**.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Architecture Diagram](#-architecture-diagram)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation Steps](#-installation-steps)
- [Ollama Setup](#-ollama-setup)
- [PostgreSQL Setup](#-postgresql-setup)
- [Environment Variables](#-environment-variables)
- [Running with Docker](#-running-with-docker)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 🧭 Project Overview

**AI Interview Coach** simulates a real technical interview end-to-end:

1. A candidate picks a **target role**, **experience level**, and **difficulty**.
2. The platform generates **5 role-specific interview questions** using a locally-hosted **Qwen3** model via **Ollama** — covering theory, tools, and real-world scenarios.
3. The candidate answers each question in a focused, distraction-free UI.
4. Every answer is evaluated by the AI across four criteria — **technical accuracy, depth of knowledge, communication clarity, and problem-solving ability** — with strengths, weaknesses, improvement tips, and an ideal model answer.
5. After all 5 questions, a **final report** is generated with an overall readiness score, a skill radar chart, and a readiness category (Excellent / Ready / Needs Improvement / Beginner).
6. Candidates can revisit their **analytics** to see score trends across multiple practice sessions.
7. Optionally, candidates can **upload a resume (PDF)** so questions are personalized to their actual projects and skills.

No proprietary or cloud LLM API (OpenAI, Anthropic, etc.) is used anywhere in this project — **only open-source models, served locally via Ollama.**

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 Role-specific question generation | Exactly 5 questions per session, tailored to the selected role's core skill categories |
| 🧠 AI answer evaluation | Scored on Technical Accuracy, Depth, Clarity, and Problem Solving (each /10) |
| 📊 Final readiness report | Circular score meter, skill radar chart, animated counters, and a readiness category |
| 📈 Analytics dashboard | Past interviews, score trend line chart, per-session bar chart, and skill distribution |
| 📄 Resume-based personalization | Upload a PDF resume; the backend extracts skills/projects/experience to tailor questions |
| 🎨 Modern SaaS UI | Dark professional theme, glassmorphism cards, gradients, and motion-driven interactions |
| 🔓 100% open-source LLM | Powered by Qwen3 8B running locally via Ollama — no API keys, no external LLM calls |

---

## 🏗 Architecture Diagram

```mermaid
flowchart LR
    subgraph Client["Frontend — React + Vite"]
        A[Landing Page] --> B[Role Selection Page]
        B --> C[Interview Page]
        C --> D[Results Dashboard]
        D --> E[Analytics Page]
    end

    subgraph Server["Backend — FastAPI"]
        F[Interview Routes]
        G[Answer Routes]
        H[Report Routes]
        I[Analytics Routes]
        J[Resume Routes]
        K[Question / Evaluation / Report Services]
        L[Qwen3 LLM Client]
    end

    subgraph Data["Persistence"]
        M[(PostgreSQL)]
    end

    subgraph LLM["Local Open-Source LLM"]
        N[Ollama Server]
        O[Qwen3 8B Model]
    end

    B -- "POST /api/interviews/generate" --> F
    C -- "POST /api/answers/submit" --> G
    D -- "GET /api/reports/:id" --> H
    E -- "GET /api/analytics" --> I
    B -- "POST /api/resume/upload" --> J

    F --> K
    G --> K
    H --> K
    K --> L
    L -- "HTTP /api/generate" --> N
    N --> O

    F --> M
    G --> M
    H --> M
    I --> M
    K --> M
```

**Flow summary:** The React frontend never talks to the LLM directly — every AI call is proxied through the FastAPI backend, which builds structured prompts, calls Ollama's `/api/generate` endpoint, parses the JSON response, and persists results to PostgreSQL.

---

## 🛠 Tech Stack

### Frontend
- **React 18** + **Vite** — fast SPA tooling
- **Tailwind CSS** — utility-first styling with a custom dark theme
- **Framer Motion** — page transitions, micro-interactions, animated counters
- **React Router** — client-side routing across the 5 pages
- **Recharts** — radar chart, line chart, bar chart, pie chart
- **Axios** — API client
- **lucide-react** — icon set

### Backend
- **FastAPI** — async Python web framework
- **Python 3.11**
- **SQLAlchemy 2.0** — ORM
- **Alembic** — database migrations
- **httpx** — async HTTP client used to call Ollama
- **PyPDF2** / **pdfplumber** — resume text extraction

### Database
- **PostgreSQL 16**

### LLM
- **Qwen3 8B**, served locally via **[Ollama](https://ollama.com)** at `http://localhost:11434/api/generate`
- **No OpenAI / Anthropic / cloud LLM APIs are used anywhere in this codebase.**

---

## 📂 Project Structure

```
AI-Interview-Coach/
├── frontend/
│   ├── src/
│   │   ├── pages/          # LandingPage, RoleSelectionPage, InterviewPage, ResultsPage, AnalyticsPage
│   │   ├── components/     # Navbar, GlassCard, ReadinessRing, AnimatedCounter, LoadingState
│   │   ├── services/       # api.js (axios client)
│   │   ├── hooks/          # useInterviewSession.js
│   │   ├── routes/         # routes.jsx
│   │   └── assets/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/
│   ├── app.py               # FastAPI entrypoint
│   ├── config.py            # Settings (env vars)
│   ├── routes/               # interview, answer, report, analytics, resume routes
│   ├── database/             # SQLAlchemy engine/session
│   ├── models/                # ORM models + Pydantic schemas
│   ├── prompts/                # Question + evaluation prompt templates
│   ├── services/                # LLM client, question/evaluation/report/resume services
│   ├── utils/                    # Shared helpers
│   ├── alembic/                   # DB migrations
│   ├── Dockerfile
│   └── .env.example
│
├── requirements.txt
├── docker-compose.yml
└── README.md
```

---

## 🚀 Installation Steps

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** 16 (or Docker)
- **Ollama** installed locally ([ollama.com/download](https://ollama.com/download))
- **Docker & Docker Compose** (optional, for containerized setup)

### 1. Clone & enter the project
```bash
git clone <your-fork-url> AI-Interview-Coach
cd AI-Interview-Coach
```

### 2. Backend setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r ../requirements.txt

cp .env.example .env            # then edit .env with your DB/Ollama settings
```

Run database migrations:
```bash
alembic upgrade head
```

Start the API server:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```
The API will be available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

### 3. Frontend setup
```bash
cd ../frontend
cp .env.example .env             # adjust VITE_API_BASE_URL if needed
npm install
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## 🤖 Ollama Setup

This project uses **Qwen3 8B** as its only LLM, served locally via Ollama.

1. **Install Ollama:**
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```
   (or download the installer for macOS/Windows from [ollama.com/download](https://ollama.com/download))

2. **Pull the Qwen3 model:**
   ```bash
   ollama pull qwen3:8b
   ```

3. **Start the Ollama server** (if not already running as a service):
   ```bash
   ollama serve
   ```

4. **Verify it's working:**
   ```bash
   curl http://localhost:11434/api/generate -d '{
     "model": "qwen3:8b",
     "prompt": "Say hello in JSON: {\"message\": \"...\"}",
     "stream": false
   }'
   ```

The backend's `OLLAMA_BASE_URL` and `OLLAMA_MODEL` environment variables control which model/endpoint it calls — swap in any other open-source model supported by Ollama if you prefer.

> 💡 If Ollama is unreachable, the backend gracefully falls back to a generic question/evaluation set so the rest of the app remains testable — check the `/health` endpoint to confirm connectivity.

---

## 🐘 PostgreSQL Setup

### Option A — Local install
```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

Create the database and user:
```sql
CREATE USER interview_user WITH PASSWORD 'interview_pass';
CREATE DATABASE ai_interview_coach OWNER interview_user;
```

### Option B — Docker
```bash
docker run --name aic_postgres \
  -e POSTGRES_USER=interview_user \
  -e POSTGRES_PASSWORD=interview_pass \
  -e POSTGRES_DB=ai_interview_coach \
  -p 5432:5432 -d postgres:16-alpine
```

Then run migrations from `backend/`:
```bash
alembic upgrade head
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Full PostgreSQL connection string | `postgresql://interview_user:interview_pass@localhost:5432/ai_interview_coach` |
| `OLLAMA_BASE_URL` | Base URL of the local Ollama server | `http://localhost:11434` |
| `OLLAMA_MODEL` | Model name to use for generation | `qwen3:8b` |
| `OLLAMA_TIMEOUT` | Request timeout (seconds) for LLM calls | `120` |
| `APP_HOST` / `APP_PORT` | FastAPI bind host/port | `0.0.0.0` / `8000` |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins | `http://localhost:5173,http://localhost:3000` |
| `MAX_RESUME_SIZE_MB` | Max upload size for resumes | `10` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the FastAPI backend | `http://localhost:8000` |

---

## 🐳 Running with Docker

A full `docker-compose.yml` is provided for the **frontend**, **backend**, and **PostgreSQL**. Ollama is intentionally run on the **host machine** (not containerized) for best performance/GPU access.

```bash
# 1. Make sure Ollama is running on your host with qwen3:8b pulled
ollama serve &
ollama pull qwen3:8b

# 2. From the project root:
docker compose up --build
```

- Frontend → `http://localhost:3000`
- Backend → `http://localhost:8000`
- PostgreSQL → `localhost:5432`

The backend container reaches your host's Ollama instance via `host.docker.internal:11434` (already configured in `docker-compose.yml`).

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check; reports Ollama connectivity |
| `POST` | `/api/interviews/generate` | Creates a candidate/interview and generates 5 questions |
| `GET` | `/api/interviews/{interview_id}` | Fetch an interview and its questions |
| `POST` | `/api/answers/submit` | Submit an answer and receive AI evaluation |
| `GET` | `/api/reports/{interview_id}` | Get the compiled final report for an interview |
| `GET` | `/api/analytics?email=` | Get past interviews, trend, and skill distribution for a candidate |
| `POST` | `/api/resume/upload` | Upload a PDF resume; returns extracted skills/projects/experience |

Full interactive documentation (Swagger UI) is auto-generated by FastAPI at:
```
http://localhost:8000/docs
```

### Example: Generate an interview
```bash
curl -X POST http://localhost:8000/api/interviews/generate \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jordan Avery",
    "email": "jordan.avery@example.com",
    "target_role": "Data Scientist",
    "experience": "1-3 Years",
    "difficulty": "Medium"
  }'
```

### Example: Submit an answer
```bash
curl -X POST http://localhost:8000/api/answers/submit \
  -H "Content-Type: application/json" \
  -d '{
    "interview_id": "<uuid>",
    "question_id": "<uuid>",
    "answer_text": "I would start by checking for class imbalance...",
    "skipped": false
  }'
```

---

## 📸 Screenshots

> Add screenshots of your running instance here once deployed.

| Landing Page | Interview Page | Final Report | Analytics |
|---|---|---|---|
| `docs/screenshots/landing.png` | `docs/screenshots/interview.png` | `docs/screenshots/report.png` | `docs/screenshots/analytics.png` |

---

## 🔮 Future Enhancements

- 🎙 **Voice-based interviews** — speech-to-text answer input and text-to-speech question playback
- 🧑‍🤝‍🧑 **Mock panel mode** — simulate multiple interviewer personas with different question styles
- 🌍 **Multi-language support** for both questions and evaluation
- 🔁 **Adaptive difficulty** — auto-adjust question difficulty based on running performance
- 🏆 **Leaderboards & gamification** for cohort/bootcamp use cases
- 🔐 **Authentication & multi-tenant support** (JWT-based login, per-user history)
- 📤 **Export final report as PDF** for sharing with mentors/recruiters
- 🧩 **Pluggable LLM backend** — support swapping Qwen3 for other open-source models (Llama 3, Mistral, DeepSeek) via a config flag
- 📡 **Streaming responses** from the LLM for a real-time "typing" evaluation effect

---

## 📄 License

This project is provided as-is for educational and portfolio purposes. Add your preferred license (MIT, Apache 2.0, etc.) here.
