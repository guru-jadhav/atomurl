package com.gurujadhav.com.gurujadhav.atomurl.exception;

import com.gurujadhav.com.gurujadhav.atomurl.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {


    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception e){
        log.error("ERROR : {}", e.getMessage());

        ApiResponse<Void> response = new ApiResponse<>(500, "failure", null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }


    @ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodArgumentTypeMismatch(
            org.springframework.web.method.annotation.MethodArgumentTypeMismatchException ex){
        String paramName = ex.getName();;
        String message = "Invalid value for parameter '" + paramName + "'.";


        if(ex.getRequiredType() != null && ex.getRequiredType().equals(java.time.LocalDate.class)){
            message = "Invalid date format for '" + paramName + "'. Expected format is YYYY-MM-DD (e.g. 2026-08-30).";
        }

        ApiResponse<Void> response = new ApiResponse<>(400, message, null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

    }
}
