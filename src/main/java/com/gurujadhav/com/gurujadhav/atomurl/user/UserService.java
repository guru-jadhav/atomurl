package com.gurujadhav.com.gurujadhav.atomurl.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gurujadhav.com.gurujadhav.atomurl.auth.oauth.UserAuthDTO;

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
        return checkAndSaveUser(email, "", "EMAIL");
    }

    public User checkAndSaveUser(String email, String name, String provider) {
        return userRepository.upsertUser(email, name, provider);
    }

    public User checkAndSaveUser(UserAuthDTO userDto) {
        return userRepository.upsertUser(userDto.getEmail(), userDto.getName(), userDto.getProvider());
    }
}
