package com.gurujadhav.com.gurujadhav.atomurl.user;

import com.gurujadhav.com.gurujadhav.atomurl.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    /**
    * @brief end point for user creation
    *
    *
    */
    @PostMapping("/api/user")
    public ResponseEntity<ApiResponse<Void>> UserCreationController(@RequestBody User user) {

        ApiResponse<Void> errorResponse = new ApiResponse<>(500, "error while restring user", null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
