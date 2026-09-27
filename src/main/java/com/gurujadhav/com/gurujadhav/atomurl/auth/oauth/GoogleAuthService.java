package com.gurujadhav.com.gurujadhav.atomurl.auth.oauth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class GoogleAuthService {

    // TODO : need to create actual credentials for Google auth
    @Value("${oauth.google.client-id:dummy-google-client-id}")
    private String googleClientId;

    @Value("${oauth.google.redirect-url:http://localhost:8080/api/auth/oauth/google/callback}")
    private String googleRedirectUri;

    public String getGoogleAuthorizationUrl(){
        String baseGoogleUrl = "https://accounts.google.com/o/oauth2/v2/auth";
        String scope = "openid email profile";
        return UriComponentsBuilder.fromUriString(baseGoogleUrl)
                .queryParam("client_id", googleClientId)
                .queryParam("redirect_uri", googleRedirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", scope)
                .encode()
                .build()
                .toUriString();
    }
}
