# System Architecture

## 1. Overview

The system is split into:

| Layer   | Description |
|---------|-------------|
| Frontend | React app using Redux Toolkit for state and React Router v6 for navigation |
| Backend  | REST API built with Express + Sequelize ORM on SQLite3 |
| Database | SQLite file stored locally or via Docker volume |
| Deployment | Docker for both frontend & backend |

---

## 2. Frontend Architecture

### 🧱 Design Principles

- **Atomic Design** (atoms > molecules > pages)
- **Redux Toolkit** for central store
- **Separation of Concerns** (UI, state, API logic)

### 📁 Structure

```bash
client/src/
├─ api/ # Axios instance and API helpers
├─ components/ # UI modules (Dashboard, TripPlanner)
├─ store/ # Redux slices (vehicles, drivers, mills, trips)
├─ types/ # Shared TypeScript interfaces
├─ App.tsx # Routes and layout wrapper
└─ main.tsx # React entry
```

## 3. Backend Architecture

### 📁 Folder Structure

```bash
server/src/
├─ models/ # Sequelize models
├─ routes/ # Express routers
├─ db/ # DB connection
├─ seed.ts # Demo data generator
├─ app.ts # Main Express app
└─ server.ts # HTTP server bootstrap
```

### ✅ Core Models

| Model      | Description                    |
|------------|---------------------------------|
| Vehicle    | Plate, type, capacity, driver  |
| Driver     | Name, license, phone, status   |
| Mill       | Name, geolocation, production  |
| Trip       | Vehicle + driver + mills route |
| Collection | FFB collected per mill         |

---

## 4. Data Flow

1. User clicks “Create Trip” in frontend  
2. Redux dispatches `createTrip()` async thunk  
3. API POST `/api/trips` > backend validates capacity & saves to DB  
4. Response adds to Redux state & dashboard updates live

---

## 5. Routing (Frontend)

| Path                 | Screen         |
|----------------------|----------------|
| `/`                  | Dashboard      |
| `/planner`           | Trip Planner   |
| `/driver`            | Driver List    |
| `/vehicle`           | Vehicle List   |
| `/trip-list`         | Trip List      |
| `/drivers/new`       | Create Driver  |
| `/drivers/:id/edit`  | Edit Driver    |
| `/vehicles/new`      | Create Vehicle |
| `/vehicles/:id/edit` | Edit Vehicle   |
| `/mill`              | Mill List      |
| `/mills/new`         | Create Mill    |
| `/mills/:id/edit`    | Edit Mill      |

---

## 6. Docker Architecture

```bash
docker-compose.yml
├─ server > Node.js + SQLite (port 4000)
└─ client > NGINX serving React app (port 3000)
```

Volumes:
- `./server/data:/app/data` > persist SQLite file

## 7. Why This Architecture?

✔ Scalable  
✔ Separated frontend & backend  
✔ Easy to test & extend  
✔ SQLite fits assignment’s constraints  
✔ Docker makes deployment trivial