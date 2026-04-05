# Agentic AI Portfolio Manager

A production-oriented platform for intelligent portfolio analysis and tracking, powered by an agentic AI workflow.

## Project Overview

**Agentic AI Portfolio Manager** is designed to help investors and analysts monitor portfolios, evaluate performance, and receive AI-assisted insights with clear reasoning. The system combines market data, portfolio state, and specialized AI agents to support transparent, data-driven decision-making.

## Features

- **Multi-agent system**: Specialized AI agents collaborate on tasks such as market interpretation, risk review, and recommendation generation.
- **Portfolio tracking**: Track holdings, performance trends, and key portfolio metrics in a structured workflow.
- **Explainable AI**: AI outputs include rationale so users can understand how insights and suggestions are produced.

## Tech Stack

- **Backend**: FastAPI
- **Frontend**: React
- **Market Data**: yfinance
- **Database**: PostgreSQL

## Folder Structure

```text
agentic-portfolio-manager/
|- backend/
|  |- app/
|  |  |- agents/
|  |  |- api/
|  |  |- core/
|  |  |- models/
|  |  |- services/
|  |  |- utils/
|  |  |- main.py
|  |- requirements.txt
|- frontend/
|- README.md
```

## Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup (FastAPI)

```bash
cd backend
python -m venv venv
# Windows PowerShell
.\venv\Scripts\Activate.ps1
# macOS/Linux
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at: `http://127.0.0.1:8000`

### Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend typically runs at: `http://localhost:5173` (or your configured React dev port)

## Future Scope

- Advanced risk analytics and scenario simulation
- Multi-broker integration and automated portfolio sync
- Backtesting engine for strategy validation
- Personalized agent behaviors based on investor profile
- Alerting and notification pipeline for portfolio events
- Deployment-ready infrastructure (CI/CD, monitoring, observability)

## License

This project is currently in active development. Add a license file (for example, MIT) before public distribution.
