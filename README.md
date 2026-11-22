# 🎮 Multi-Game Platform

Multiplayer browser game platform with **Ludo, Bingo, Chess, and UNO**.  
No login, no database — rooms identified by a 3-digit numeric code.

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in two browser tabs to test.

## Stack
- **Frontend**: React 18 + Vite + Zustand + Socket.IO + Tailwind + Framer Motion + PixiJS
- **Backend**: FastAPI + python-socketio + uvicorn

See `IMPLEMENTATION_PLAN.md` for full spec.
