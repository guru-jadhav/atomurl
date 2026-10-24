package com.gurujadhav.com.gurujadhav.atomurl.user;

import com.gurujadhav.com.gurujadhav.atomurl.auth.AuthService;
import com.gurujadhav.com.gurujadhav.atomurl.auth.EmailDto;
import com.gurujadhav.com.gurujadhav.atomurl.auth.OtpValidationDto;
import com.gurujadhav.com.gurujadhav.atomurl.common.ApiResponse;
import com.gurujadhav.com.gurujadhav.atomurl.common.CurrentUser;
import com.gurujadhav.com.gurujadhav.atomurl.common.RateLimit;

import jakarta.validation.Valid;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @Autowired
    UserService userService;

    @Autowired 
    AuthService authService;
    
    @GetMapping("/api/user/urls")
    public ResponseEntity<ApiResponse<List<UserUrlResponse>>> getUserUrls(
            @CurrentUser(required = true) User user) {

        List<UserUrlResponse> responseData = userService.getUserUrls(user.getId());
        ApiResponse<List<UserUrlResponse>> successResponse = new ApiResponse<>(200, "success", responseData);
        return ResponseEntity.status(HttpStatus.OK).body(successResponse);
    }

    @GetMapping("/api/user/profile")
    public ResponseEntity<ApiResponse<User>> getUserProfile( @CurrentUser(required = true) User user){

        ApiResponse<User> responseData = new ApiResponse<>(200, "success", user);
        return ResponseEntity.status(HttpStatus.OK).body(responseData);
    }

    @RateLimit(limit = 5, duration = 60, message = "Too many requests. Please try after 1 minute")
    @PatchMapping("/api/user/profile/update-name")
    public ResponseEntity<ApiResponse<User>> updateName(
        @CurrentUser(required = true) User user,
        @Valid @RequestBody UpdateNameDto updateNameDto){
        
        
        user.setName(updateNameDto.getName());
        User getUser = userService.SaveUser(user);
        ApiResponse<User> responseData = new ApiResponse<>(200, "success", getUser);
        return ResponseEntity.status(HttpStatus.OK).body(responseData);
    }
    

    @RateLimit(limit = 1, duration = 30, message = "OTP already sent")
    @PostMapping("/api/user/profile/email")
    public ResponseEntity<ApiResponse<Void>> updateProfile(
        @CurrentUser(required = true) User user,
        @Valid  @RequestBody EmailDto email){

        if(!user.getSigninProvider().equals("EMAIL")){
            ApiResponse<Void> errorResponse = new ApiResponse<>(400, "Invalid request", null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
        
        if(user.getEmail().equals(email.getEmail())){
            ApiResponse<Void> errorResponse = new ApiResponse<>(400, "New email must be different from current email", null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }

        Optional<User> checkUser = userService.getUserByEmail(email.getEmail());
        if(checkUser.isPresent()){
            ApiResponse<Void> errorResponse = new ApiResponse<>(400, "Email already in use", null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
        
        authService.sendOtp(email);
        ApiResponse<Void> success = new ApiResponse<>(200, "OTP Sent Successfully", null);
        return ResponseEntity.status(HttpStatus.OK).body(success);
    }

    @RateLimit(limit = 5, duration = 60, message = "OTP Validation Limit Exceeded")
    @PostMapping("/api/user/profile/email/validate-otp")
    public ResponseEntity<ApiResponse<User>> validateEmailChangeOtp(
        @CurrentUser(required = true) User user,
        @Valid @RequestBody OtpValidationDto otpValidation) {
        
        if(!user.getSigninProvider().equals("EMAIL")){
            ApiResponse<User> errorResponse = new ApiResponse<>(400, "Invalid request", null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }

        authService.otpValidationHelper(otpValidation);
        User updatedUser = userService.updateEmail(user, otpValidation.getEmail());

        ApiResponse<User> successResponse = new ApiResponse<>(200, "success", updatedUser);
        return ResponseEntity.status(HttpStatus.OK).body(successResponse);
    }
    
}
