package com.gurujadhav.com.gurujadhav.atomurl.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@AllArgsConstructor 
@NoArgsConstructor 
public class UpdateNameDto {
    @NotBlank(message = "Name is required")
    @Size(min = 1, max = 100, message = "Name must be atleast of 1 character and cannot be more than 100 characters")
    private String name;
}
