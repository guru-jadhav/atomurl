# atomURL Backend

Spring Boot REST service that handles link generation, redirection, click analytics, user authentication, and admin operations.

## Tech Stack

- **Language & Framework**: Java 25, Spring Boot 3.x
- **Persistence**: Spring Data JPA, Hibernate, PostgreSQL 15
- **Migrations**: Flyway (`src/main/resources/db/migration/`)
- **Caching**: [CacheClient](https://github.com/guru-jadhav/CacheClient) connecting to [CacheCore](https://github.com/guru-jadhav/CacheCore) (C++ TCP service) on port 6948
- **Security**: Stateless JWT authentication, Spring Security, token versioning, rate limiting

## End-to-End Custom Caching (CacheCore & CacheClient)

Instead of using an off-the-shelf cache like Redis, this service integrates a custom caching stack built from scratch:

- **Cache Server**: **[CacheCore](https://github.com/guru-jadhav/CacheCore)** — A custom in-memory key-value cache server written in C++, running as a standalone TCP daemon on port 6948 (Docker image `gurujadhav471/cachecore:latest`).
- **Java Client Driver**: **[CacheClient](https://github.com/guru-jadhav/CacheClient)** — A custom Java client library (`com.github.guru-jadhav:CacheClient`) imported via Maven to handle TCP socket communication and cache commands (`GET`, `SET`, `DEL`, `INCR`, `PING`).

When a short link is requested via `GET /{shortCode}`, the backend checks CacheCore over TCP via CacheClient before querying PostgreSQL, minimizing database hits on hot links.

## How It Works

- **Short Code Generation**: When a URL is saved, its sequential database ID is encoded into Base62.
- **Redirection & Caching**: When `GET /{shortCode}` is called:
  1. Decodes the code to retrieve the ID.
  2. Queries CacheCore over TCP for the cached destination URL.
  3. If not in cache, queries PostgreSQL and populates CacheCore.
  4. Records the click in the analytics table and returns an HTTP 302 redirect.
- **Rate Limiting**: Sliding-window rate limiting counters stored in CacheCore (`RL:<METHOD>:<PATH>:<IP>`) protect public and sensitive endpoints from brute forcing and abuse.
- **Keyset Pagination**: `GET /api/user/urls` uses keyset (cursor) pagination. Passing `after={shortCode}` fetches links older than that ID via the indexed `user_id` column, avoiding slow offset queries. Limit is clamped between 1 and 100 (default 15).
- **Authentication & Token Versioning**:
  - Supports passwordless login via 6-digit email OTP (sent via SMTP / Mailpit) and OAuth2 with Google and GitHub.
  - Authenticated requests pass a `Bearer <token>` header containing a `tokenVersion` claim.
  - When a user changes their email address, their `token_version` column in PostgreSQL is incremented. All previously minted tokens for that user are immediately invalidated across all devices without needing a stateful token blacklist.
  - Admin accounts are protected against email modification through profile update endpoints.
- **Admin Infrastructure & Telemetry**:
  - Secured via `AdminInterceptor` checking caller authorization and token validity.
  - Live system connectivity checks: PostgreSQL query latency, CacheCore status via native RESP `PING()`, and SMTP mailer availability.
  - Platform metric aggregations: URLs, clicks, active users, and JVM memory utilization.
  - Paginated user directory with name/email search.
  - In-memory circular error buffer capturing up to 100 recent service exceptions with manual purge.

## Database Migrations

Managed with Flyway:
- `V1__init_schema.sql`: Core tables (`users`, `urls`, `analytical`).
- `V2__update_users_schema.sql`: Provider and profile fields.
- `V3__add_urls_user_id_index.sql`: Index on `urls(user_id)` for optimized keyset cursor pagination.
- `V4__add_token_version_to_users.sql`: Adds `token_version INT NOT NULL DEFAULT 1` for multi-device token revocation.

## API Reference

| Endpoint | Method | Query / Body | Description | Auth |
| :--- | :---: | :--- | :--- | :---: |
| `/api/urls` | `POST` | `{"longUrl": "https://..."}` | Shortens a URL | Optional |
| `/{shortCode}` | `GET` | — | Redirects to destination and records click | No |
| `/api/urls/{shortCode}` | `DELETE` | — | Deletes short link, cache entry & analytics | Yes |
| `/api/user/urls` | `GET` | `after` *(optional code)*, `limit` *(default 15)* | Keyset paginated user links | Yes |
| `/api/analytical/{code}` | `GET` | `pastdays` *(default 30)* | Click history breakdown | No |
| `/api/auth/send-otp` | `POST` | `{"email": "..."}` | Sends login OTP | No |
| `/api/auth/validate-otp` | `POST` | `{"email": "...", "otp": "..."}` | Validates OTP and returns JWT | No |
| `/api/auth/oauth/{provider}/login` | `GET` | — | Initiates OAuth flow (Google / GitHub) | No |
| `/api/user/profile` | `GET` | — | Returns user profile details | Yes |
| `/api/user/profile/update-name` | `PATCH` | `{"name": "..."}` | Updates display name | Yes |
| `/api/user/profile/send-email-otp`| `POST` | `{"email": "..."}` | Sends verification OTP to new email address | Yes |
| `/api/user/profile/update-email` | `PATCH` | `{"email": "...", "otp": "..."}` | Verifies OTP, updates email, increments `token_version` & returns fresh JWT | Yes |
| `/api/admin/overview` | `GET` | — | Live health checks (Postgres, CacheCore PING, SMTP) & platform telemetry | Admin |
| `/api/admin/users` | `GET` | `query`, `page`, `limit` | Paginated platform user directory with search | Admin |
| `/api/admin/errors` | `GET` | — | In-memory system error buffer (recent 100 entries) | Admin |
| `/api/admin/errors` | `DELETE`| — | Clears in-memory error buffer | Admin |

## Running Locally

Ensure your `.env` configuration file is initialized from the root template:
```bash
cp ../.env.example ../.env
```

Make sure PostgreSQL, CacheCore, and Mailpit are running via Docker:
```bash
docker compose up -d db cachecore mailpit
```

Run the backend with your `.env` loaded:
```bash
set -a && source ../.env && set +a && ./mvnw clean spring-boot:run
```

Run tests:
```bash
./mvnw test
```
