package com.gurujadhav.com.gurujadhav.atomurl.admin;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedDeque;

@Component
public class ErrorRingBuffer {

    public record ErrorRecord(
            String id,
            Instant timestamp,
            String service,
            String message,
            String details
    ) {}

    private static final int MAX_CAPACITY = 100;
    private final ConcurrentLinkedDeque<ErrorRecord> buffer = new ConcurrentLinkedDeque<>();

    public void record(String service, String message, String details) {
        if (buffer.size() >= MAX_CAPACITY) {
            buffer.pollLast(); // Drop oldest record
        }
        String id = String.valueOf(System.currentTimeMillis()) + "-" + (buffer.size() + 1);
        buffer.addFirst(new ErrorRecord(id, Instant.now(), service, message, details));
    }

    public List<ErrorRecord> getRecentErrors() {
        return new ArrayList<>(buffer);
    }

    public void clear() {
        buffer.clear();
    }
}
