package com.gurujadhav.com.gurujadhav.atomurl.repository;

import com.gurujadhav.com.gurujadhav.atomurl.model.Analytical;
import com.gurujadhav.com.gurujadhav.atomurl.model.AnalyticalId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

public interface AnalyticalRepository extends JpaRepository<Analytical, AnalyticalId> {

    @Transactional
    @Modifying
    @Query(value =  "INSERT INTO analytical (url_id, access_date, access_count) " +
                    "VALUES (:urlId, :accessDate, 1) " +
                    "ON CONFLICT (url_id, access_date) " +
                    "DO UPDATE SET access_count = analytical.access_count + 1",
            nativeQuery = true)
    void incrementClickCount(@Param("urlId") Long urlId, @Param("accessDate")LocalDate accessDate);


    List<Analytical> findByUrlIdAndAccessDateGreaterThanEqualOrderByAccessDateDesc(Long urlId, LocalDate startDate);

    @Transactional
    @Modifying
    @Query(value = "WITH rows_to_delete AS (" +
            "       SELECT ctid FROM public.analytical" +
            "       WHERE access_date < :cutoffDate" +
            "       LIMIT :batchSize)" +
            "       DELETE FROM public.analytical" +
            "       WHERE ctid IN (SELECT ctid FROM rows_to_delete)",
        nativeQuery = true)
    int deleteAnalyticsBatch(@Param("cutoffDate") LocalDate cutoffDate, @Param("batchSize") int batchSize);

}
