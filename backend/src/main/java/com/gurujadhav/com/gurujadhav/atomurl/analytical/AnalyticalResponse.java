package com.gurujadhav.com.gurujadhav.atomurl.analytical;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticalResponse {
    private LocalDate date;
    private int clicks;
}
