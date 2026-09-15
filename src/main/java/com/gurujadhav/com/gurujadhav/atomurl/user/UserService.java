package com.gurujadhav.com.gurujadhav.atomurl.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    UserRepository userRepository;

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }


    public User SaveUser(User user) {
        return userRepository.save(user);
    }

    public User checkAndSaveUser(String email) {
        return checkAndSaveUser(email, "EMAIL");
    }

    public User checkAndSaveUser(String email, String provider) {
        return userRepository.upsertUser(email, provider);
    }
}
