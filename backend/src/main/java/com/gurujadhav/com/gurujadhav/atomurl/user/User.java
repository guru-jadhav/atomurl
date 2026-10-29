package com.gurujadhav.com.gurujadhav.atomurl.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    private String name;

    @Column(name = "last_login_date")
    @Builder.Default
    private LocalDateTime lastLoginDate = LocalDateTime.now();

    @Column(name = "signin_provider", nullable = false)
    private String signinProvider;

    @Column(name = "token_version", nullable = false)
    @Builder.Default
    private Integer tokenVersion = 1;

    @PrePersist
    protected void onCreate() {
        if(this.lastLoginDate == null){
            this.lastLoginDate = LocalDateTime.now();
        }
        if(this.tokenVersion == null){
            this.tokenVersion = 1;
        }
    }
}
