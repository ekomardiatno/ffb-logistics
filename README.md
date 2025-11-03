# Fleet Management System – Palm Oil Mill Logistics

A production-ready logistic system for Fresh Fruit Bunch (FFB) evacuation fleet management.

## ✅ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18 + TypeScript + Vite      |
| State     | Redux Toolkit                     |
| Backend   | Express.js + Sequelize + SQLite3  |
| Testing   | Jest (backend), Vitest + RTL (frontend) |
| Deployment| Docker + docker-compose           |

## 📁 Project Structure

```bash
fleet-management/
├─ server/ # Express + Sequelize + SQLite
├─ client/ # React + Redux Toolkit + Vite
├─ docker-compose.yml
├─ README.md
├─ ARCHITECTURE.md
├─ API.md
└─ TESTING.md
```

## 🚀 Running the App

### ✅ Option 1 – Docker (Recommended)

```bash
docker-compose up --build
```

- Client: http://localhost:3000
- API: http://localhost:4000/api

## ✅ Option 2 – Run Locally (Dev Mode)

Backend:
```bash
cd server
npm install
npm run migrate # DB Migration
npm run seed   # Populate DB with sample data, optional
npm run dev    # http://localhost:4000
```

Frontend:
```bash
cd client
npm install
npm run dev    # http://localhost:3000
```

## 🧪 Run Tests

```bash
# Backend
cd server && npm test
```

# Frontend
cd client && npm test

## 📦 Production Build

```bash
docker-compose up --build
```

## 📂 Seed Data
- 20 Drivers
- 20 Vehicles
- 30 Mills
- 10,000 Trips (completed)

Run manually:
```bash
cd server && npm run seed
```

## ✅ Features
- Fleet Dashboard (vehicles, drivers, daily trip summary)
- Trip Planner: assign vehicle + driver + mills with capacity validation
- Driver management
- Trip Management
- Vehicle Management
- Mill Management
- Modular architecture following atomic design
- Error boundaries, optimistic UI, API abstraction
- SQLite-based persistence
- Fully containerized with Docker

## 📘 Documentation

- ARCHITECTURE.md – System design & rationale
- API.md – All REST endpoints
- TESTING.md – Test coverage and strategy

## 🛠 Commands Overview

| Description          | Command                     |
| -------------------- | --------------------------- |
| Install dependencies | `npm install`               |
| Seed database        | `npm run seed`              |
| Start backend        | `npm run dev`               |
| Start frontend       | `npm run dev`               |
| Run all in Docker    | `docker-compose up --build` |
| Run backend tests    | `npm test`                  |