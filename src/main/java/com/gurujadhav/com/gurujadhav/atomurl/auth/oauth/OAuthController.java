package com.gurujadhav.com.gurujadhav.atomurl.auth.oauth;

import com.gurujadhav.com.gurujadhav.atomurl.common.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
public class OAuthController {

    @Autowired
    OAuthService oAuthService;

    @GetMapping("/api/auth/oauth/{provider}/login")
    public ResponseEntity<ApiResponse<Void>> handleAuthLogin(
            @PathVariable(value = "provider") String provider){

        // Call auth service
        String providerAuthUrl = oAuthService.getAuthorizationUrl(provider);

        return ResponseEntity.status(HttpStatus.TEMPORARY_REDIRECT)
                .location(URI.create(providerAuthUrl))
                .build();
    }


    // TODO : if we successfully validate the user then we, can redirect them
    //  to home "/" endpoint with a token

    @GetMapping("/api/auth/oauth/{provider}/callback")
    public ResponseEntity<ApiResponse<String>> handleCallback(
            @PathVariable("provider") String provider,
            @RequestParam(value = "code") String code){

        String token = oAuthService.validateCode(provider, code);
        ApiResponse<String> response = new ApiResponse<>(200, "Authentication successful", token);

        return ResponseEntity.status(HttpStatus.OK).body(response);

    }

}
