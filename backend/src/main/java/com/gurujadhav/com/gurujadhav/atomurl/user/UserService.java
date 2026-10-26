package com.gurujadhav.com.gurujadhav.atomurl.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gurujadhav.com.gurujadhav.atomurl.auth.oauth.UserAuthDTO;
import com.gurujadhav.com.gurujadhav.atomurl.url.UrlRepository;
import com.gurujadhav.com.gurujadhav.atomurl.url.UserUrlProjection;
import com.gurujadhav.com.gurujadhav.atomurl.utils.Base62;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    UrlRepository urlRepository;

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

    public Optional<User> getUserById(Long userId) {
        return userRepository.findById(userId);
    }

    public List<UserUrlResponse> getUserUrls(Long userId, Integer limit, Long lastId, Long searchId, String pattern) {
        List<UserUrlProjection> response = urlRepository.findUserUrlsWithClickCount(userId, limit, lastId, searchId, pattern);

        return response.stream()
                .map(url -> new UserUrlResponse(
                            Base62.encode(url.getId()), 
                            url.getLongUrl(), 
                            url.getCreatedDate(), 
                            url.getTotalClicks() != null ? url.getTotalClicks() : 0L))
                .toList();
    }

    public User updateEmail(User user, String newEmail){
        user.setEmail(newEmail);
        return userRepository.save(user);
    }
}
