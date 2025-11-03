# Testing Strategy

## ✅ Tools Used

| Layer     | Tool                    |
|-----------|--------------------------|
| Backend   | Jest + Supertest         |
| Frontend  | Vitest + React Testing Library |
| Coverage  | 80% target for core logic |

---

## 🧪 Backend Tests

Types of tests:
- ✅ API endpoint tests (`/health`, `/trips`)
- ✅ Model validation
- ✅ Error scenarios (capacity exceeded)

Run tests:
```bash
cd server
npm test
```

## 🧪 Frontend Tests

Test cases:

- ✅ Render Dashboard
- ✅ Trip planner form works
- ✅ Redux slice reducers/actions

Run tests:
```bash
cd client
npm test
```

## ✅ Coverage Goals

| Area             | Target |
| ---------------- | ------ |
| Models & logic   | 80%    |
| React components | 70%+   |
| API routes       | 80%    |

Generate coverage:
```bash
npm test -- --coverage
```

## 📌 Performance & Error Testing

- Stress test with 1000+ trips (seed script supports this)
- Error boundary catches React runtime errors
- SQLite handles concurrency via transaction locks