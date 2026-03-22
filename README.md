# Events & bookings (microservices)

Stack: **Event Service**, **Booking Service** (validates events via HTTP), **API Gateway** (reverse proxy), and a **React + Vite** UI.

## MongoDB

Event and booking data are stored in **MongoDB**. Each service uses its own connection string:

- **Event service:** `MONGODB_URI` in `services/event-service/.env` (see `.env.example`).
- **Booking service:** `MONGODB_URI` in `services/booking-service/.env` (see `.env.example`).

Use two databases (or two Atlas clusters) if you already have two URIs. Bookings still validate events by calling the event service over HTTP.

## Run locally (no Docker)

Copy the `.env.example` files and set your MongoDB URIs, then start four terminals (Node 20+):

```bash
cd services/event-service && cp .env.example .env && npm install && npm run dev
```

```bash
cd services/booking-service && cp .env.example .env && npm install && npm run dev
```

```bash
cd services/api-gateway && npm install && npm run dev
```

```bash
cd frontend && npm install && npm run dev
```

Open `http://localhost:5173`. The dev server proxies `/api` to the gateway on `8080`.

**Frontend env:** keep `VITE_API_BASE` **empty** in `frontend/.env` during dev so the browser calls `/api/...` on the Vite server (same origin). If you set `VITE_API_BASE=http://localhost:8080`, the browser calls the gateway directly (cross-origin); that can work with CORS, but an empty base + proxy is more reliable. After changing `.env`, restart `npm run dev`.

## Run with Docker

Create a `.env` in the project root (see root `.env.example`) with `EVENT_SERVICE_MONGODB_URI` and `BOOKING_SERVICE_MONGODB_URI`, then:

```bash
docker compose up --build
```

Open `http://localhost` (port 80). Nginx in the frontend container proxies `/api` to the gateway.

## CI/CD

- **`.github/workflows/ci.yml`** — builds all Node services and the frontend, builds Docker images, runs **SonarCloud** (needs `SONAR_TOKEN` in repo secrets).
- **`.github/workflows/deploy-aws.yml`** — manual **Deploy AWS** workflow: push images to **ECR** (configure secrets and run from the Actions tab).

## SonarCloud

1. Create a project at [SonarCloud](https://sonarcloud.io).
2. Set `sonar.organization` and `sonar.projectKey` in `sonar-project.properties` to match the SonarCloud project.
3. Add a GitHub secret `SONAR_TOKEN` from SonarCloud.

## AWS

1. Create ECR repositories (e.g. `ctse-event-service`, …) or one prefix pattern as in the deploy workflow.
2. Add secrets: `AWS_REGION`, `ECR_REGISTRY`, `ECR_REPOSITORY_PREFIX` (optional), and either OIDC (`AWS_ROLE_ARN` + choose **oidc** when running the workflow) or `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` (choose **access-keys**).
3. See `aws/ecs-task-definition.example.json` as a starting point for **ECS Fargate**.

## Ports

| Service         | Port |
|----------------|------|
| Event Service  | 3001 |
| Booking Service| 3002 |
| API Gateway    | 8080 |
| Frontend (dev) | 5173 |
| Frontend (Docker) | 80 |
