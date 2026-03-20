# MotoCare Jobs

MotoCare Jobs is a small full-stack motorcycle service job tracker built as a QA Automation portfolio project. It focuses on auth, bike management, service job workflows, controlled status transitions, API validation, UI automation, and running the app in Docker.

---

## What this project demonstrates

The project demonstrates work across the full stack:

- **Frontend:** Vite + Vanilla TypeScript UI
- **Backend:** Node.js + Express + TypeScript REST API
- **Persistence:** SQLite database
- **Workflow logic:** controlled service-job status transitions
- **API testing:** Playwright APIRequestContext coverage
- **UI automation:** Playwright end-to-end user-flow coverage
- **Testability:** stable "data-testid" selectors and page-object-based UI tests
- **Containerization:** Docker + Docker Compose

---

## Features

### Authentication

- User registration
- User login
- Logout
- Auth persistence across refresh
- Per-user data isolation

### Bikes

- Add bikes
- Delete bikes
- Bike list persistence across refresh
- Empty state handling
- Per-user bike isolation
- Derived bike readiness state:
  - **Ready** if no open jobs exist
  - **Not ready** if at least one related open job exists

### Service jobs

- Create service jobs for a selected bike
- View jobs list
- Persist jobs across refresh
- Per-user job isolation
- Per-bike job association

### Job statuses

MotoCare Jobs supports these statuses:

- "requested"
- "approved"
- "in_progress"
- "done"
- "cancelled"

Allowed transitions:

- "requested > approved"
- "requested > cancelled"
- "approved > in_progress"
- "approved > cancelled"
- "in_progress > done"

Invalid transitions are rejected by the backend and covered by automated tests.

### Filtering

Jobs can be filtered by status:

- All
- Requested
- Approved
- In Progress
- Done
- Cancelled

### Integrity behavior

- Deleting a bike removes its related jobs
- Bike readiness updates based on job state
- Job status changes affect bike readiness correctly

---

## Tech stack

- **Frontend:** Vite + Vanilla TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite
- **Testing:** Playwright
- **Containerization:** Docker + Docker Compose

---

## Project structure

```text
/web    -> frontend client (Vite + TypeScript)
/api    -> backend REST API (Node + Express + TypeScript)
/tests  -> Playwright API + UI tests
/docs   -> screenshots / assets
```

## Main entities

### User

- register
- login
- logout

### Bike

- make
- model
- year
- readiness state

### Job

- bike
- service type
- odometer
- note
- status

## API coverage

The project includes API-level tests for the main backend workflows.

### Auth API

- register success
- login success
- validation and error cases

### Bikes API

- create bike success
- missing field validation
- invalid year validation
- list only current user bikes
- delete bike
- deleting a bike removes related jobs

### Jobs API

- create job success
- missing bike validation
- missing service type validation
- missing odometer validation
- invalid odometer validation
- list only current user jobs
- valid status transitions
- invalid status transitions
- forbidden / not found cases

## UI coverage

The project includes Playwright end-to-end coverage for the main user-visible workflows.

### Bikes UI

- add bike
- delete bike
- persistence after refresh
- empty state behavior
- user isolation
- readiness state changes based on jobs

### Jobs UI

- create job
- persistence after refresh
- visible validation errors
- requested > approved
- approved > in progress
- in progress > done
- requested > cancelled
- approved > cancelled
- status filtering
- deleting a bike removes related jobs from the UI

## Running locally

You need to run both the backend and frontend.

Terminal 1 — API

```bash
cd api
npm install
npm run dev
```

Terminal 2 — Web

```bash
cd web
npm install
npm run dev
```

Then open the local frontend URL shown by Vite.

## Running with Docker

MotoCare Jobs can also be run through Docker Compose.

### Start the full stack

```bash
docker compose up --build
```

### Stop the containers

```bash
docker compose down
```

## Running tests

### API / UI tests locally

Run tests from the repo root.

```bash
npm install
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:ui
```

Run tests against the Dockerized app

```bash
npm run docker:test:up
npm run test:docker
npm run docker:test:down
```

or

```bash
npm run test:docker:fresh
```
