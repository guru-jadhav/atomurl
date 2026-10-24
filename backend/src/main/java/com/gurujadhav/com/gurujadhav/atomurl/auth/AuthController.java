package com.gurujadhav.com.gurujadhav.atomurl.auth;

import com.gurujadhav.com.gurujadhav.atomurl.common.ApiResponse;
import com.gurujadhav.com.gurujadhav.atomurl.common.RateLimit;

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

    @RateLimit(limit = 1, duration = 30, message = "OTP already sent")
    @PostMapping("/api/auth/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp( @Valid @RequestBody EmailDto email) {

        authService.sendOtp(email);
        ApiResponse<Void> success = new ApiResponse<>(200, "OTP Sent Successfully", null);
        return ResponseEntity.status(HttpStatus.OK).body(success);
    }

    @RateLimit(limit = 5, duration = 60, message = "OTP Validation Limit Exceeded")
    @PostMapping("/api/auth/validate-otp")
    public ResponseEntity<ApiResponse<String>> validateOtp(@Valid @RequestBody OtpValidationDto otpValidation){

        String token = authService.validateOtpAndGetToken(otpValidation);

        ApiResponse<String> success = new ApiResponse<>(200, "OTP Validation Successfully", token);
        return ResponseEntity.status(HttpStatus.OK).body(success);

    }
}
