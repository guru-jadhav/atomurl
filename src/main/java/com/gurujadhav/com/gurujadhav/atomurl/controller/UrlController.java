package com.gurujadhav.com.gurujadhav.atomurl.controller;

import com.gurujadhav.com.gurujadhav.atomurl.dto.ApiResponse;
import com.gurujadhav.com.gurujadhav.atomurl.dto.UrlResponse;
import com.gurujadhav.com.gurujadhav.atomurl.model.Url;
import com.gurujadhav.com.gurujadhav.atomurl.service.UrlService;
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

    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> reDirectController (@PathVariable String shortCode){
        String longUrl = urlService.resolveShortCode(shortCode);

        if(longUrl.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.status(HttpStatus.TEMPORARY_REDIRECT).location(URI.create(longUrl)).build();
    }

    @PostMapping("/api/urls")
    public ResponseEntity<ApiResponse<UrlResponse>> createShortUrl(@RequestBody Url url){
        UrlResponse responseData = urlService.createNewShortUrl(url);

        if(responseData == null){
            ApiResponse<UrlResponse> errorResponse = new ApiResponse<>(500, "failure", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }else{
            ApiResponse<UrlResponse> successResponse = new ApiResponse<>(201, "success", responseData);
            return ResponseEntity.status(HttpStatus.CREATED).body(successResponse);
        }
    }

}
