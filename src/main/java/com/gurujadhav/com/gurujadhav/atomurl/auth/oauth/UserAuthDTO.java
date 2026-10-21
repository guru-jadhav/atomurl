package com.gurujadhav.com.gurujadhav.atomurl.auth.oauth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserAuthDTO {
    private String email;
    private String name;
    private String provider;
}
