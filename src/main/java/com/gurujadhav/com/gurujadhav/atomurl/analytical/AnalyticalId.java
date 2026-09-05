package com.gurujadhav.com.gurujadhav.atomurl.analytical;


import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class AnalyticalId implements Serializable {
    private Long urlId;
    private LocalDate accessDate;
}
