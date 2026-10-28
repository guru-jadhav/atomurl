package com.gurujadhav.com.gurujadhav.atomurl.auth.oauth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class GoogleAuthService {

    record GoogleTokenResponse(String access_token) {
    }

    record GoogleUserInfo(String email, String name) {
    }

    // TODO : need to create actual credentials for Google auth
    @Value("${oauth.google.client-id:}")
    private String googleClientId;

    @Value("${oauth.google.client-secret:}")
    private String googleClientSecret;

    @Value("${oauth.google.redirect-uri:http://localhost:8080/api/auth/oauth/google/callback}")
    private String googleRedirectUri;

    private final RestClient restClient = RestClient.create();

    public String getGoogleAuthorizationUrl() {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new OAuthAuthenticationException("Google OAuth is not configured on this server");
        }
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

    public UserAuthDTO processCallback(String code) {

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("client_id", googleClientId);
        body.add("client_secret", googleClientSecret);
        body.add("redirect_uri", googleRedirectUri);
        body.add("grant_type", "authorization_code");

        GoogleTokenResponse tokenResponse;
        try {
            tokenResponse = restClient.post()
                    .uri("https://oauth2.googleapis.com/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(body)
                    .retrieve()
                    .body(GoogleTokenResponse.class);
        } catch (RestClientException e) {
            throw new OAuthAuthenticationException("Failed to get access token from Google : " + e.getMessage());
        }

        if (tokenResponse == null || tokenResponse.access_token() == null) {
            throw new OAuthAuthenticationException("Failed to get access token from Google");
        }

        String accessToken = tokenResponse.access_token();

        GoogleUserInfo userInfo = null;

        try {
            userInfo = restClient.get()
                    .uri("https://www.googleapis.com/oauth2/v3/userinfo")
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(GoogleUserInfo.class);
        } catch (Exception e) {
            throw new OAuthAuthenticationException("Failed to retrieve user info from Google : " + e.getMessage());
        }

        if (userInfo == null || userInfo.email() == null || userInfo.email().isBlank()) {
            throw new OAuthAuthenticationException("Failed to retrieve verified email from Google");
        }

        return new UserAuthDTO(userInfo.email(), userInfo.name() != null ? userInfo.name() : "", "GOOGLE");
    }
}
