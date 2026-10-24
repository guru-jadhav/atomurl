package com.gurujadhav.com.gurujadhav.atomurl.auth.oauth;

import com.gurujadhav.com.gurujadhav.atomurl.common.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
public class OAuthController {

    @Value("${oauth.frontend-redirect-url:http://localhost:3000/auth/callback}")
    private String frontendRedirectUrl;


    @Autowired
    OAuthService oAuthService;

    @GetMapping("/api/auth/oauth/{provider}/login")
    public ResponseEntity<ApiResponse<Void>> handleAuthLogin(
            @PathVariable(value = "provider") String provider) {

        // Call auth service
        String providerAuthUrl = oAuthService.getAuthorizationUrl(provider);

        return ResponseEntity.status(HttpStatus.TEMPORARY_REDIRECT)
                .location(URI.create(providerAuthUrl))
                .build();
    }

    // TODO : if we successfully validate the user then we, can redirect them
    // to home "/" endpoint with a token

    @GetMapping("/api/auth/oauth/{provider}/callback")
    public ResponseEntity<Void> handleCallback(
            @PathVariable("provider") String provider,
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "error_description", required = false) String errorDescription) {

        if (error != null) {
            String message = (errorDescription != null) ? errorDescription : "OAuth access denied: " + error;
            throw new OAuthAuthenticationException(message);
        }

        if (code == null || code.isBlank()) {
            throw new OAuthAuthenticationException("Missing authorization code");
        }

        String token = oAuthService.validateCode(provider, code);
        // ApiResponse<String> response = new ApiResponse<>(200, "Authentication successful", token);
        
        String redirectUrl = frontendRedirectUrl + "?token=" + token;
        
        return ResponseEntity.status(HttpStatus.TEMPORARY_REDIRECT).location(URI.create(redirectUrl)).build();

    }

}
