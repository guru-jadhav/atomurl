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
}
