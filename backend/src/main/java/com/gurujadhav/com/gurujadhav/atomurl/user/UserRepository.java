package com.gurujadhav.com.gurujadhav.atomurl.user;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    @Transactional
    @Query(value = "INSERT INTO public.users " +
            "       (email, name, signin_provider, last_login_date) values " +
            "       (:email, :name, :signin_provider, NOW()) " +
            "       ON CONFLICT (email) " +
            "       DO UPDATE SET last_login_date = NOW(), name = COALESCE(NULLIF(EXCLUDED.name, ''), users.name) " +
            "       RETURNING *", nativeQuery = true)
    User upsertUser(@Param("email") String email, @Param("name") String name,
            @Param("signin_provider") String signin_provider);

    @Query(value = "SELECT COUNT(*) FROM users WHERE DATE(last_login_date) = :today", nativeQuery = true)
    long getTodayActiveUsersCount(@Param("today") java.time.LocalDate today);

    @Query(value = "SELECT u.id AS id, u.email AS email, u.name AS name, u.signin_provider AS signinProvider, " +
                   "u.last_login_date AS lastLoginDate, COUNT(url.id) AS urlCount " +
                   "FROM users u " +
                   "LEFT JOIN urls url ON u.id = url.user_id " +
                   "WHERE (:query IS NULL OR :query = '' OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%'))) " +
                   "GROUP BY u.id, u.email, u.name, u.signin_provider, u.last_login_date " +
                   "ORDER BY u.id DESC",
           countQuery = "SELECT COUNT(*) FROM users u " +
                        "WHERE (:query IS NULL OR :query = '' OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')))",
           nativeQuery = true)
    org.springframework.data.domain.Page<com.gurujadhav.com.gurujadhav.atomurl.admin.AdminUserProjection> findAdminUsersWithUrlCount(
            @Param("query") String query,
            org.springframework.data.domain.Pageable pageable);
}
