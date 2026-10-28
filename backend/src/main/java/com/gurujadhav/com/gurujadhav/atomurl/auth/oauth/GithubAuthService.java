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
public class GithubAuthService {

    record GithubTokenResponse(String access_token) {
    }

    record GithubUserInfo(String email, String name) {
    }

    record GithubEmail(String email, boolean primary, boolean verified) {
    }

    // TODO : need to create actual credentials for Github auth
    @Value("${oauth.github.client-id:}")
    private String githubClientId;

    @Value("${oauth.github.client-secret:}")
    private String githubClientSecret;

    @Value("${oauth.github.redirect-uri:http://localhost:8080/api/auth/oauth/github/callback}")
    private String githubRedirectUri;

    private final RestClient restClient = RestClient.create();

    private String getEmail(String accessToken) {
        GithubEmail[] emails;
        try {
            emails = restClient.get()
                    .uri("https://api.github.com/user/emails")
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(GithubEmail[].class);
        } catch (RestClientException e) {
            throw new OAuthAuthenticationException("Failed to get emails from Github : " + e.getMessage());
        }

        String resolvedEmail = null;

        if (emails != null) {
            for (GithubEmail email : emails) {
                if (email.verified() && (email.email() != null && !email.email().isBlank())) {
                    resolvedEmail = email.email();
                    if (email.primary()) {
                        break;
                    }
                }
            }
        }

        return resolvedEmail;
    }

    public String getGithubAuthorizationUrl() {
        if (githubClientId == null || githubClientId.isBlank()) {
            throw new OAuthAuthenticationException("GitHub OAuth is not configured on this server");
        }
        String baseGithubUrl = "https://github.com/login/oauth/authorize";
        String scope = "read:user user:email";

        return UriComponentsBuilder.fromUriString(baseGithubUrl)
                .queryParam("client_id", githubClientId)
                .queryParam("redirect_uri", githubRedirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", scope)
                .encode()
                .build()
                .toUriString();
    }

    public UserAuthDTO processCallback(String code) {

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("client_id", githubClientId);
        body.add("client_secret", githubClientSecret);
        body.add("redirect_uri", githubRedirectUri);

        GithubTokenResponse tokenResponse;

        try {
            tokenResponse = restClient.post()
                    .uri("https://github.com/login/oauth/access_token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(GithubTokenResponse.class);
        } catch (RestClientException e) {
            throw new OAuthAuthenticationException("Failed to get access token from Github : " + e.getMessage());
        }

        if (tokenResponse == null || tokenResponse.access_token() == null) {
            throw new OAuthAuthenticationException("Failed to get access token from Github");
        }

        String accessToken = tokenResponse.access_token();
        GithubUserInfo userInfo = null;

        try {
            userInfo = restClient.get()
                    .uri("https://api.github.com/user")
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(GithubUserInfo.class);
        } catch (RestClientException e) {
            throw new OAuthAuthenticationException("Failed to get user info from Github : " + e.getMessage());
        }

        if (userInfo.email() == null || userInfo.email().isBlank()) {
            String email = getEmail(accessToken);
            if (email == null || email.isBlank()) {
                throw new OAuthAuthenticationException("Failed to get verified email from Github");
            }

            userInfo = new GithubUserInfo(email, userInfo.name());
        }

        return new UserAuthDTO(userInfo.email(), userInfo.name() != null ? userInfo.name() : "", "GITHUB");
    }
}
