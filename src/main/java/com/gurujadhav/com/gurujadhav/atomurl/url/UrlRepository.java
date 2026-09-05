package com.gurujadhav.com.gurujadhav.atomurl.url;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

public interface UrlRepository extends JpaRepository<Url, Long> {

    @Transactional
    @Modifying
    @Query(value = "WITH rows_to_delete AS ( " +
            "       SELECT ctid FROM public.urls" +
            "       WHERE user_id IS NULL AND" +
            "       created_date < :cutoffDate" +
            "       LIMIT :batchSize)" +
            "       DELETE FROM public.urls" +
            "       WHERE ctid IN (SELECT ctid FROM rows_to_delete)",
            nativeQuery = true)
    int deleteOrphanUrlBatch(@Param("cutoffDate") LocalDate cutoffDate, @Param("batchSize") int batchSize);
}
