# Unified Event Analytics Engine

**Backend API for collecting, storing, and analyzing website and mobile app events.**  
Built with **Node.js, Express, Prisma, PostgreSQL, Redis**, and **Dockerized** for scalable deployment.

---

## Table of Contents

- [Overview](#overview)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Architecture & Flow](#architecture--flow)  
- [API Documentation](#api-documentation)  
- [Setup & Run](#setup--run)  
- [Testing](#testing)  
- [Deployment](#deployment)  
- [Challenges & Solutions](#challenges--solutions)  
- [Future Enhancements](#future-enhancements)  
- [License](#license)

---

## Overview

This project implements a **scalable backend API** for analytics events, supporting:

- High-volume event ingestion (clicks, visits, referrer, device info, etc.)  
- API key authentication for apps/websites  
- Event aggregation for reporting  
- Redis caching for performance optimization  
- Containerized deployment using Docker  

---

## Features

### API Key Management
- `POST /api/auth/register` – Register a new app and generate API key  
- `GET /api/auth/api-key` – Retrieve API key for a registered app  
- `POST /api/auth/revoke` – Revoke an API key (supports optional regeneration)  

### Event Collection
- `POST /api/analytics/collect` – Submit analytics events with headers authentication  

### Analytics Endpoints
- `GET /api/analytics/event-summary` – Event aggregation summary  
- `GET /api/analytics/user-stats` – User-based event stats  
- `GET /api/analytics/daily-stats` – Event stats per day  
- `GET /api/analytics/top-pages` – Top visited pages  

---

## Tech Stack

- **Backend:** Node.js, Express  
- **Database:** PostgreSQL (managed on Render)  
- **ORM:** Prisma  
- **Caching:** Redis (Render Key-Value)  
- **Authentication:** API Key  
- **Testing:** Jest, Supertest  
- **Documentation:** Swagger  
- **Containerization:** Docker  

---

## Architecture & Flow

![alt text](image.png)


- **Redis**: Caches API key validation and frequently requested analytics data  
- **Prisma**: Handles database queries and migrations  
- **Docker**: Ensures consistent environment across development and deployment  

---

## API Documentation

Swagger documentation with all endpoints, request/response formats, and examples is available at:  
[https://unified-event-analytics-wdpr.onrender.com/api/docs](https://unified-event-analytics-wdpr.onrender.com/api/docs)

---

## Setup & Run Locally

1. Clone repository:

```bash
git clone https://github.com/princeprakhar/Analytics-engine.git
cd Analytics-engine
```

2. Create `.env` file:

```env
DATABASE_URL=postgres://username:password@localhost:5432/analytics
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=8080
```

3. Build and run using Docker:

```bash
cd docker
docker-compose up --build
```

- API will be accessible at `http://localhost:8080`

4. Run Prisma migrations:

```bash
docker exec -it <container_name> npx prisma migrate deploy
```

---

## Testing

Run unit and integration tests using Jest:

```bash
npm test
```

Tests cover:

- API key registration, retrieval, and revocation  
- Event collection  
- Analytics endpoints with aggregation and filtering  
- Redis caching validation  

---

## Deployment

This project is deployed on **Render** using Docker:

- **PostgreSQL**: Managed by Render  
- **Redis**: Key-value store in Render  
- Automatic Prisma migrations included in Dockerfile  

**Deployment URL:**  
[https://unified-event-analytics-wdpr.onrender.com](https://unified-event-analytics-wdpr.onrender.com)

**GitHub Repository:**  
[https://github.com/princeprakhar/Analytics-engine](https://github.com/princeprakhar/Analytics-engine)

---

## Challenges & Solutions

- **Prisma `P2021` error on Render** – Solved by automating `npx prisma migrate deploy` in Dockerfile  
- **Testing with API keys** – Implemented dynamic key creation during test setup  
- **Redis integration** – Cached API key validation to reduce DB calls  
- **Rate limiting & performance** – Used Redis caching for frequent queries  

---

## Future Enhancements

- Implement **rate-limiting per API key** for production traffic control  
- Add **JWT-based authentication** for more secure API access  
- Extend analytics with **funnel tracking and conversion metrics**  
- Implement **background jobs** for heavy aggregation using Bull or Agenda  
- Add **multi-tenancy support** for multiple users and organizations  

---

## License

MIT License © Prakhar Deep