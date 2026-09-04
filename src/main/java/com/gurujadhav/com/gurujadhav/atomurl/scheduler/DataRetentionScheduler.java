package com.gurujadhav.com.gurujadhav.atomurl.scheduler;

import com.gurujadhav.com.gurujadhav.atomurl.repository.AnalyticalRepository;
import com.gurujadhav.com.gurujadhav.atomurl.repository.UrlRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
public class DataRetentionScheduler {

    @Autowired
    UrlRepository urlRepository;

    @Autowired
    AnalyticalRepository analyticalRepository;


    private void deleteOlderUrl(LocalDate cutoffDate, int batchSize){
        int totalDeletedUrls = 0;
        int urlBatchCount;
        do {
            urlBatchCount = urlRepository.deleteOrphanUrlBatch(cutoffDate, batchSize);
            totalDeletedUrls += urlBatchCount;

            if (urlBatchCount > 0) {
                log.info("Purged {} orphan URLs batch (Total: {})", urlBatchCount, totalDeletedUrls);
            }

            try {
                Thread.sleep(50);
            } catch (InterruptedException ignored) {

            }

        } while (urlBatchCount > 0);
    }

    private void deleteOldAnalytical(LocalDate cutoffDate, int batchSize){
        int totalDeletedAnalytics  = 0;
        int analyticsBatchCount;
        do {
            analyticsBatchCount = analyticalRepository.deleteAnalyticsBatch(cutoffDate, batchSize);
            totalDeletedAnalytics += analyticsBatchCount;

            if (analyticsBatchCount > 0) {
                log.info("Purged {} analytics batch (Total: {})", analyticsBatchCount, totalDeletedAnalytics);
            }

            try {
                Thread.sleep(50);
            } catch (InterruptedException ignored) {

            }

        } while (analyticsBatchCount > 0);
    }

    @Scheduled(cron = "0 0 2 * * *")
    public void purgeExpiredDate() {
        log.info(">>> Starting nightly data retention cleanup task...");

        LocalDate cutoffDate = LocalDate.now().minusDays(30);
        int batchSize = 10000;

        deleteOlderUrl(cutoffDate, batchSize);
        deleteOldAnalytical(cutoffDate, batchSize);

    }

}