package com.gurujadhav.com.gurujadhav.atomurl.analytical;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "analytical")
@IdClass(AnalyticalId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Analytical {

    @Id
    @Column(name = "url_id", nullable = false)
    private Long urlId;

    @Id
    @Column(name = "access_date")
    @Builder.Default
    private LocalDate accessDate = LocalDate.now();

    @Column(name = "access_count", nullable = false)
    @Builder.Default
    private int accessCount = 1;
}
