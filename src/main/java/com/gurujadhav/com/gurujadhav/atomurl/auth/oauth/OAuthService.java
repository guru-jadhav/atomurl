package com.gurujadhav.com.gurujadhav.atomurl.auth.oauth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OAuthService {

    @Autowired
    GoogleAuthService googleAuthService;

    @Autowired
    GithubAuthService githubAuthService;

    public String getAuthorizationUrl(String provider){

        return switch (provider.toLowerCase()) {
            case "google" -> googleAuthService.getGoogleAuthorizationUrl();
            case "github" -> githubAuthService.getGithubAuthorizationUrl();
            default -> throw new IllegalArgumentException("Unsupported provider: " + provider);
        };
    }

    public String validateCode(String provider, String code){
        return "return jwt token";
    }

}
