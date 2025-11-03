# API Documentation

Base URL: `http://localhost:4000/api`

---

## 🚗 Vehicle APIs

| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| GET    | /vehicles                   | List all vehicles     |
| POST   | /vehicles                   | Create new vehicle    |
| PUT    | /vehicles/:id               | Update vehicle        |
| DELETE | /vehicles/:id               | Delete vehicle        |
| PATCH  | /vehicles/:id/status        | Update vehicle status |
| PATCH  | /vehicles/:id/assign-driver | Assigning driver      |

## 🧑 Driver APIs

| Method | Endpoint            | Description   |
| ------ | ------------------- | ------------- |
| GET    | /drivers            | List drivers  |
| POST   | /drivers            | Create driver |
| PUT    | /drivers/:id        | Update driver |
| DELETE | /drivers/:id        | Delete driver |
| PATCH  | /drivers/:id/status | Update status |

## 🌾 Mill APIs

| Method | Endpoint   | Description |
| ------ | ---------- | ----------- |
| GET    | /mills     | List mills  |
| POST   | /mills     | Create mill |
| PUT    | /mills/:id | Update mill |
| DELETE | /mills/:id | Delete mill |

## 🚚 Trip APIs

| Method | Endpoint            | Description             |
| ------ | ------------------- | ----------------------- |
| GET    | /trips              | List all trips          |
| POST   | /trips              | Create new trip         |
| PATCH  | /trips/:id/status   | Update trip status      |
| PUT    | /trips              | Update trip information |

Example Create Trip:

```json
{
  "vehicleId": "uuid",
  "driverId": "uuid",
  "scheduledDate": "2025-01-01T00:00:00.000Z",
  "estimatedDuration": 90,
  "mills": [
    { "millId": "uuid1", "plannedCollection": 6 },
    { "millId": "uuid2", "plannedCollection": 4 }
  ]
}

```
Constraints:
- ❌ Reject if total > 12 tons (vehicle capacity)

## ✅ Health Check

```bash
GET /health > { "ok": true }
```