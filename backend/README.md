# atomURL Backend

Spring Boot REST service that handles link generation, redirection, click analytics, and user authentication.

## Tech Stack

- **Language & Framework**: Java 25, Spring Boot 3.x
- **Persistence**: Spring Data JPA, Hibernate, PostgreSQL 15
- **Migrations**: Flyway (`src/main/resources/db/migration/`)
- **Caching**: [CacheClient](https://github.com/guru-jadhav/CacheClient) connecting to [CacheCore](https://github.com/guru-jadhav/CacheCore) (C++ TCP service) on port 6948
- **Security**: Stateless JWT authentication, Spring Security

## End-to-End Custom Caching (CacheCore & CacheClient)

Instead of using an off-the-shelf cache like Redis, this service integrates a custom caching stack built from scratch:

- **Cache Server**: **[CacheCore](https://github.com/guru-jadhav/CacheCore)** — A custom in-memory key-value cache server written in C++, running as a standalone TCP daemon on port 6948 (Docker image `gurujadhav471/cachecore:latest`).
- **Java Client Driver**: **[CacheClient](https://github.com/guru-jadhav/CacheClient)** — A custom Java client library (`com.github.guru-jadhav:CacheClient`) imported via Maven to handle TCP socket communication and cache commands (GET, SET, DEL).

When a short link is requested via `GET /{shortCode}`, the backend checks CacheCore over TCP via CacheClient before querying PostgreSQL, minimizing database hits on hot links.

## How It Works

- **Short Code Generation**: When a URL is saved, its sequential database ID is encoded into Base62.
- **Redirection & Caching**: When `GET /{shortCode}` is called:
  1. Decodes the code to retrieve the ID.
  2. Queries CacheCore over TCP for the cached destination URL.
  3. If not in cache, queries PostgreSQL and updates CacheCore.
  4. Records the click in the analytics table and returns an HTTP 302 redirect.
- **Pagination**: `GET /api/user/urls` uses keyset (cursor) pagination. Passing `after={shortCode}` fetches links older than that ID, avoiding slow offset queries. Limit is clamped between 1 and 100 (default 15).
- **Auth**: Supports passwordless login via 6-digit email OTP (sent via SMTP / Mailpit) and OAuth2 with Google and GitHub. Authenticated requests pass a `Bearer <token>` header.

## Database Migrations

Managed with Flyway:
- `V1__init_schema.sql`: Core tables (`users`, `urls`, `analytical`).
- `V2__update_users_schema.sql`: Provider and profile fields.

## API Reference

| Endpoint | Method | Query / Body | Description |
| :--- | :---: | :--- | :--- |
| `/api/urls` | `POST` | `{"longUrl": "https://..."}` | Shortens a URL |
| `/{shortCode}` | `GET` | — | Redirects to destination and records click |
| `/api/urls/{shortCode}` | `DELETE` | — | Deletes short link and cache entry |
| `/api/user/urls` | `GET` | `after` *(optional code)*, `limit` *(default 15)* | Paginated user links |
| `/api/analytical/{code}` | `GET` | `pastdays` *(default 30)* | Click history breakdown |
| `/api/auth/send-otp` | `POST` | `{"email": "..."}` | Sends login OTP |
| `/api/auth/validate-otp` | `POST` | `{"email": "...", "otp": "..."}` | Validates OTP and returns JWT |
| `/api/user/profile` | `GET` | — | Returns profile details |
| `/api/user/profile/update-name` | `PATCH` | `{"name": "..."}` | Updates display name |

## Running Locally

Make sure PostgreSQL, CacheCore, and Mailpit are running via Docker:
```bash
docker compose up -d db cachecore mailpit
```

Run the backend:
```bash
./mvnw clean spring-boot:run
```

Run tests:
```bash
./mvnw test
```
