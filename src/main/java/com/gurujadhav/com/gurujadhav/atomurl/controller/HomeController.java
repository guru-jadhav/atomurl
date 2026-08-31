package com.gurujadhav.com.gurujadhav.atomurl.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<String> handleHomePage(){
        return ResponseEntity.status(HttpStatus.OK).body("Home Page");
    }

    @GetMapping("/api")
    public ResponseEntity<String> handleApi() {
        return ResponseEntity.status(HttpStatus.OK).body("Handle API");
    }
}
