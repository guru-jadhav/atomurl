package com.gurujadhav.com.gurujadhav.atomurl.auth;

import com.gurujadhav.com.gurujadhav.atomurl.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/api/auth/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp( @Valid @RequestBody EmailDto email) {

        authService.sendOtp(email);
        ApiResponse<Void> success = new ApiResponse<>(200, "OTP Sent Successfully", null);
        return ResponseEntity.status(HttpStatus.OK).body(success);
    }

    @PostMapping("/api/auth/validate-otp")
    public ResponseEntity<ApiResponse<String>> validateOtp(@Valid @RequestBody OtpValidationDto otpValidation){

        String token = authService.validateOtp(otpValidation);

        ApiResponse<String> success = new ApiResponse<>(200, "OTP Validation Successfully", token);
        return ResponseEntity.status(HttpStatus.OK).body(success);

    }
}
