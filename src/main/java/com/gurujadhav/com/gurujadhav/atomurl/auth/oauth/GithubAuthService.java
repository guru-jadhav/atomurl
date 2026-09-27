package com.gurujadhav.com.gurujadhav.atomurl.auth.oauth;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class GithubAuthService {

    // TODO : need to create actual credentials for Github auth
    @Value("${oauth.github.client-id:dummy-github-client-id}")
    private String githubClientId;

    @Value("${oauth.github.redirect-uri:http://localhost:8080/api/auth/oauth/github/callback}")
    private String githubRedirectUri;


    public String getGithubAuthorizationUrl() {
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
}
