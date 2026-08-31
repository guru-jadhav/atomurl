package com.gurujadhav.com.gurujadhav.atomurl.controller;

import com.gurujadhav.cacheclient.CacheClient;
import com.gurujadhav.com.gurujadhav.atomurl.service.UrlService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@Slf4j
@RestController
public class UrlController {

    @Autowired
    private UrlService urlService;

    @Autowired
    private CacheClient cache;


    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> reDirectController (@PathVariable String shortCode){
        String longUrl = urlService.resolveShortCode(shortCode);

        if(longUrl.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        return ResponseEntity.status(HttpStatus.TEMPORARY_REDIRECT).location(URI.create(longUrl)).build();
    }

    @GetMapping("/put/{code}")
    public ResponseEntity<String> putCode(@PathVariable String code){
        try {
            cache.SET(0, code, "https://www.google.com", false);
            return ResponseEntity.status(HttpStatus.OK).body("Added to Cache");
        } catch (Exception e) {
            log.info(e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.OK).body("Failed to add to Cache");
    }

}
