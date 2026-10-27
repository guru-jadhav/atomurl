package com.gurujadhav.com.gurujadhav.atomurl.url;

import com.gurujadhav.com.gurujadhav.atomurl.common.ApiResponse;
import com.gurujadhav.com.gurujadhav.atomurl.common.CurrentUser;
import com.gurujadhav.com.gurujadhav.atomurl.common.RateLimit;
import com.gurujadhav.com.gurujadhav.atomurl.user.User;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@Slf4j
@RestController
public class UrlController {

    @Autowired
    private UrlService urlService;

    private static final String SCHEME_REGEX = "^[a-zA-Z][a-zA-Z0-9+.-]*://\\S+$";

    private boolean isValidScheme(String longUrl){
        if(longUrl == null || longUrl.isBlank()){
            return false;
        }

        String trimmed = longUrl.trim();
        if(!trimmed.matches(SCHEME_REGEX)){
            return false;
        }

        try{
            URI uri = URI.create(trimmed);
            return uri.getScheme() != null && !uri.getScheme().isBlank();
        } catch (Exception e){
            return false;
        }
    }

    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> reDirectController(@PathVariable String shortCode) {
        String longUrl = urlService.resolveShortCode(shortCode);

        if (longUrl.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.status(HttpStatus.TEMPORARY_REDIRECT).location(URI.create(longUrl)).build();
    }

    @RateLimit(limit = 15, duration = 60, message = "Too many requests. Please try after 1 minute")
    @PostMapping("/api/urls")
    public ResponseEntity<ApiResponse<UrlResponse>> createShortUrl(
            @RequestBody Url url,
            @CurrentUser User user) {

        if (url == null || url.getLongUrl() == null || url.getLongUrl().isBlank()) {
            ApiResponse<UrlResponse> errorResponse = new ApiResponse<>(400,
                    "Required request body is missing or malformed", null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }


        if (!isValidScheme(url.getLongUrl())) {
            ApiResponse<UrlResponse> errorResponse = new ApiResponse<>(422,
                    "Invalid URL: URL must include a valid protocol scheme (e.g. https://example.com or test://example.com)", null);
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_CONTENT).body(errorResponse);
        }

        url.setLongUrl(url.getLongUrl().trim());
        url.setUser(user);

        UrlResponse responseData = urlService.createNewShortUrl(url);

        if (responseData == null) {
            ApiResponse<UrlResponse> errorResponse = new ApiResponse<>(500, "failure", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        } else {
            ApiResponse<UrlResponse> successResponse = new ApiResponse<>(201, "success", responseData);
            return ResponseEntity.status(HttpStatus.CREATED).body(successResponse);
        }
    }


    @RateLimit(limit = 15, duration = 60, message = "Too many requests. Please try after 1 minute")
    @DeleteMapping("/api/urls/{shortcode}")
    public ResponseEntity<ApiResponse<Void>> deleteUrl(
            @PathVariable String shortcode,
            @CurrentUser(required = true) User user){
        
        urlService.deleteUrl(shortcode, user);

        ApiResponse<Void> response = new ApiResponse<>(200, "Url deleted successfully", null);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

}
