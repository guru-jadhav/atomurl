package com.gurujadhav.com.gurujadhav.atomurl.auth.oauth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gurujadhav.com.gurujadhav.atomurl.jwt.JwtService;
import com.gurujadhav.com.gurujadhav.atomurl.user.User;
import com.gurujadhav.com.gurujadhav.atomurl.user.UserService;

@Service
public class OAuthService {

    @Autowired
    GoogleAuthService googleAuthService;

    @Autowired
    GithubAuthService githubAuthService;

    @Autowired
    UserService userService;

    @Autowired
    JwtService jwtService;

    public String getAuthorizationUrl(String provider) {

        return switch (provider.toLowerCase()) {
            case "google" -> googleAuthService.getGoogleAuthorizationUrl();
            case "github" -> githubAuthService.getGithubAuthorizationUrl();
            default -> throw new IllegalArgumentException("Unsupported provider: " + provider);
        };
    }

    public String validateCode(String provider, String code) {

        UserAuthDTO userAuthDTO = switch (provider.toLowerCase()) {
            case "google" -> googleAuthService.processCallback(code);
            case "github" -> githubAuthService.processCallback(code);
            default -> throw new IllegalArgumentException("Unsupported provider: " + provider);
        };

        User user = userService.checkAndSaveUser(userAuthDTO);
        return jwtService.getJWTToken(user);
    }

}
