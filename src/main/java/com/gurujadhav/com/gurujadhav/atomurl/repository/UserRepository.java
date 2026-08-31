package com.gurujadhav.com.gurujadhav.atomurl.repository;

import com.gurujadhav.com.gurujadhav.atomurl.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

}
