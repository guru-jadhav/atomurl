package com.gurujadhav.com.gurujadhav.atomurl.url;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

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


    @Transactional 
    @Query(value = "SELECT u.id AS id, " + 
            "       u.long_url AS longUrl, " +
            "       u.created_date AS createdDate, " +
            "       COALESCE(SUM(a.access_count), 0) AS totalClicks " +
            "       FROM urls u " +
            "       LEFT JOIN analytical a ON u.id = a.url_id " +
            "       WHERE u.user_id = :userId " +
            "       AND(:lastId IS NULL OR u.id < :lastId) " +
            "       AND(:pattern IS NULL OR LOWER(u.long_url) LIKE :pattern OR (:searchId IS NOT NULL AND u.id = :searchId))" +
            "       GROUP BY u.id, u.long_url, u.created_date " +
            "       ORDER BY u.id DESC " +
            "       LIMIT :limit ",
    nativeQuery = true )
    List<UserUrlProjection> findUserUrlsWithClickCount(
        @Param("userId") long userId, 
        @Param("limit") Integer limit, 
        @Param("lastId") Long lastId,
        @Param("searchId") Long searchId,
        @Param("pattern") String pattern);

    @Query(value = "SELECT COUNT(*) FROM urls WHERE created_date = :today", nativeQuery = true)
    long getTodayUrlsCount(@Param("today") LocalDate today);
}
