# darco2903.fr — Main Web Server

Personal web portal built with **Express** (Node.js) and **Vue 3**. Acts as the central entry point of my self-hosted infrastructure: handles user profile management, user settings, and routing to downstream services.

---

## Overview

This server is the front door of my personal ecosystem. It does not expose heavy business logic itself — instead it:

- Delegates authentication to a dedicated auth service (separate repository)
- Lets users manage their profile and settings (UI only, changes are sent to the auth service)
- Redirects to other services (CDN, game server manager, and other internal tools)

---

## Tech stack

| Layer      | Technology                                                      |
| ---------- | --------------------------------------------------------------- |
| Backend    | Node.js / Express                                               |
| Frontend   | Vue 3                                                           |
| Auth       | Delegated to a separate auth service (see related repositories) |
| Deployment | VPS (self-hosted)                                               |

---

## Architecture

Each service in this ecosystem lives in its own repository and exposes its own API contract (defined in a dedicated contract repo). This server consumes those contracts — it does not own the logic of downstream services.

```
          ┌─────────────────────────┐
          │       darco2903.fr      │  ← you are here
          │     Express + Vue 3     │
          └────────────┬────────────┘
                       │
         ┌─────────────┼──────────────┐
         │             │              │
    ┌────▼───┐    ┌────▼────┐    ┌────▼──────────┐
    │  Auth  │    │   CDN   │    │  Game server  │
    └────────┘    └─────────┘    │    manager    │
                                 └───────────────┘
```

---

## Features

- **Service routing** — links and redirects to the rest of the infrastructure
- **User UI** — profile editing, user settings — UI only, all logic is handled by the auth service

---

## Related repositories

| Repository             | Role                                                   |
| ---------------------- | ------------------------------------------------------ |
| Auth service           | User authentication and profile management _(private)_ |
| CDN service            | Content Delivery Network _(private)_                   |
| Game Server Manager    | Game server management _(private)_                     |
| _(API contract repos)_ | Per-service API definitions                            |

---

## Local development

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

> Make sure the auth service is reachable and that the root `.env` is configured (see [Configuration](#configuration)).

---

## Configuration

Copy [`.env.example`](./.env.example) to `.env` in the root folder and fill it in. The server and the client both use it: the client config (service origins) is put in `index.html` by the server when it is served, so one client build works with any environment.

---

## Deployment

Runs on a VPS with Docker.

1. Copy `.env.example` to `.env` and fill it in, with `SERVER_LISTEN=0.0.0.0` and `SERVER_PORT=8080` (the port published in [`compose.yml`](./compose.yml)). Put the SSL certificates in `ssl/`, they are mounted read-only.

2. Start it

   ```bash
   docker compose up -d --build
   ```

---

## License

Personal project — not intended for reuse. No license.
