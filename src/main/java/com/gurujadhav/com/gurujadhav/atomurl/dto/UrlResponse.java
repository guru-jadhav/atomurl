package com.gurujadhav.com.gurujadhav.atomurl.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UrlResponse {
    private String shortCode;
    private String longUrl;
    private LocalDateTime createdDate;
}
