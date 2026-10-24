package com.gurujadhav.com.gurujadhav.atomurl.user;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserUrlResponse {
    private String shortCode;
    private String longUrl;
    private LocalDateTime createdDate;
    private long totalClicks;
}
