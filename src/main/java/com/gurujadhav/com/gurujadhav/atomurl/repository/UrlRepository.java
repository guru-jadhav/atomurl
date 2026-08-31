package com.gurujadhav.com.gurujadhav.atomurl.repository;

import com.gurujadhav.com.gurujadhav.atomurl.model.Url;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UrlRepository extends JpaRepository<Url, Long> {

    Optional<Url> findById(Long id);
}
