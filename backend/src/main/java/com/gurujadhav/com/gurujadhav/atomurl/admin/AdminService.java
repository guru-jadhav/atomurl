package com.gurujadhav.com.gurujadhav.atomurl.admin;

import com.gurujadhav.cacheclient.CacheClient;
import com.gurujadhav.com.gurujadhav.atomurl.analytical.AnalyticalRepository;
import com.gurujadhav.com.gurujadhav.atomurl.url.UrlRepository;
import com.gurujadhav.com.gurujadhav.atomurl.user.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Map;

@Slf4j
@Service
public class AdminService {

    @Value("${admin.emails:}")
    private String adminEmailsRaw;

    @Value("${spring.mail.host:localhost}")
    private String mailHost;

    @Value("${spring.mail.port:1025}")
    private int mailPort;

    @Autowired
    private CacheClient cache;

    @Autowired
    private UrlRepository urlRepository;

    @Autowired
    private AnalyticalRepository analyticalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ErrorRingBuffer errorRingBuffer;

    @PersistenceContext
    private EntityManager entityManager;

    public boolean isAdmin(String email) {
        if (email == null || email.isBlank() || adminEmailsRaw == null || adminEmailsRaw.isBlank()) {
            return false;
        }
        return Arrays.stream(adminEmailsRaw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .anyMatch(admin -> admin.equalsIgnoreCase(email.trim()));
    }

    public Map<String, Object> checkDatabaseHealth() {
        long start = System.currentTimeMillis();
        try {
            entityManager.createNativeQuery("SELECT 1").getSingleResult();
            long latency = System.currentTimeMillis() - start;
            return Map.of("status", "UP", "latencyMs", latency);
        } catch (Exception e) {
            long latency = System.currentTimeMillis() - start;
            errorRingBuffer.record("DATABASE", "PostgreSQL health check failed: " + e.getMessage(), e.toString());
            return Map.of("status", "DOWN", "latencyMs", latency, "error", e.getMessage() != null ? e.getMessage() : "Connection failed");
        }
    }

    public Map<String, Object> checkCacheCoreHealth() {
        long start = System.currentTimeMillis();
        try {
            cache.PING();
            long latency = System.currentTimeMillis() - start;
            return Map.of("status", "UP", "latencyMs", latency);
        } catch (Exception e) {
            long latency = System.currentTimeMillis() - start;
            errorRingBuffer.record("CACHECORE", "CacheCore health check failed: " + e.getMessage(), e.toString());
            return Map.of("status", "DOWN", "latencyMs", latency, "error", e.getMessage() != null ? e.getMessage() : "TCP Cache unreachable");
        }
    }

    public Map<String, Object> getSystemOverview() {
        LocalDate today = LocalDate.now();

        // 1. Service Connectivity
        Map<String, Object> dbHealth = checkDatabaseHealth();
        Map<String, Object> cacheHealth = checkCacheCoreHealth();
        Map<String, Object> mailHealth = Map.of(
                "host", mailHost,
                "port", mailPort,
                "status", "CONFIGURED"
        );

        // 2. Platform Counters
        long totalUrls = urlRepository.count();
        long totalClicks = analyticalRepository.getTotalPlatformClicks();
        long totalUsers = userRepository.count();

        long todayUrls = urlRepository.getTodayUrlsCount(today);
        long todayClicks = analyticalRepository.getTodayPlatformClicks(today);
        long todayActiveUsers = userRepository.getTodayActiveUsersCount(today);

        // 3. JVM Memory & Runtime
        Runtime runtime = Runtime.getRuntime();
        long totalMem = runtime.totalMemory() / (1024 * 1024);
        long freeMem = runtime.freeMemory() / (1024 * 1024);
        long usedMem = totalMem - freeMem;
        long maxMem = runtime.maxMemory() / (1024 * 1024);
        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();

        Map<String, Object> jvmStats = Map.of(
                "usedMemoryMb", usedMem,
                "totalMemoryMb", totalMem,
                "maxMemoryMb", maxMem,
                "uptimeSeconds", uptimeMs / 1000
        );

        return Map.of(
                "services", Map.of(
                        "database", dbHealth,
                        "cachecore", cacheHealth,
                        "mail", mailHealth
                ),
                "metrics", Map.of(
                        "totalUrls", totalUrls,
                        "totalClicks", totalClicks,
                        "totalUsers", totalUsers,
                        "todayUrls", todayUrls,
                        "todayClicks", todayClicks,
                        "todayActiveUsers", todayActiveUsers
                ),
                "jvm", jvmStats
        );
    }

    public Page<AdminUserProjection> getAdminUsers(String query, int page, int size) {
        String safeQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        int safePage = Math.max(0, page);
        int safeSize = (size <= 0 || size > 100) ? 20 : size;
        return userRepository.findAdminUsersWithUrlCount(safeQuery, PageRequest.of(safePage, safeSize));
    }
}
