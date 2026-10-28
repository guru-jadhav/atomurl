package com.gurujadhav.com.gurujadhav.atomurl.config;

import com.gurujadhav.cacheclient.CacheClient;
import lombok.extern.slf4j.Slf4j;

import java.util.Collection;
import java.util.Optional;
import java.util.Stack;

/**
 * Resilient wrapper around CacheClient that automatically detects broken or
 * severed TCP socket connections (e.g. when CacheCore container is restarted)
 * and reconnects seamlessly without requiring a Spring Boot restart.
 */
@Slf4j
public class ResilientCacheClient extends CacheClient {

    private final String domain;
    private final int port;

    public ResilientCacheClient(String domain, int port) {
        super(domain, port);
        this.domain = domain;
        this.port = port;
    }

    private synchronized boolean tryReconnect() {
        try {
            close();
            boolean connected = connect();
            if (connected) {
                log.info(">>> Successfully reconnected to CacheCore on {}:{}", domain, port);
                return true;
            }
        } catch (Exception e) {
            log.debug("CacheCore reconnection attempt failed: {}", e.getMessage());
        }
        return false;
    }

    @Override
    public <T> Optional<T> GET(int db, String key, Class<T> type) {
        try {
            return super.GET(db, key, type);
        } catch (Exception e) {
            if (tryReconnect()) {
                return super.GET(db, key, type);
            }
            throw e;
        }
    }

    @Override
    public <T> Optional<T> GET(int db, String key, Class<T> containerType, Class<?> elementType) {
        try {
            return super.GET(db, key, containerType, elementType);
        } catch (Exception e) {
            if (tryReconnect()) {
                return super.GET(db, key, containerType, elementType);
            }
            throw e;
        }
    }

    @Override
    public <T> boolean SET(int db, String key, T value) {
        return SET(db, key, value, true);
    }

    @Override
    public <T> boolean SET(int db, String key, T value, boolean willExpire) {
        try {
            return super.SET(db, key, value, willExpire);
        } catch (Exception e) {
            if (tryReconnect()) {
                return super.SET(db, key, value, willExpire);
            }
            throw e;
        }
    }

    @Override
    public boolean DEL(int db, String key) {
        try {
            return super.DEL(db, key);
        } catch (Exception e) {
            if (tryReconnect()) {
                return super.DEL(db, key);
            }
            throw e;
        }
    }

    @Override
    public String PING() {
        try {
            return super.PING();
        } catch (Exception e) {
            if (tryReconnect()) {
                return super.PING();
            }
            throw e;
        }
    }
}

