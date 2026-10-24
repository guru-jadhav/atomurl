-- 1. create user table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    last_login_date TIMESTAMP
);


-- 2. create url table

CREATE TABLE urls (
    id BIGSERIAL PRIMARY KEY,
    long_url TEXT NOT NULL,
    user_id BIGINT,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_urls_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. create analytical table
CREATE TABLE analytical (
    url_id BIGINT NOT NULL,
    access_date DATE NOT NULL DEFAULT CURRENT_DATE,
    access_count INT NOT NULL DEFAULT 1,
    PRIMARY KEY (url_id, access_date),
    CONSTRAINT fk_analytical_url FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE
);