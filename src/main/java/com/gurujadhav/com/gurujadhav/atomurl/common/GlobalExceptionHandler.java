package com.gurujadhav.com.gurujadhav.atomurl.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Global exception handler providing centralized error handling across all controllers.
 * Intercepts thrown exceptions and translates them into uniform {@link ApiResponse} payloads.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Fallback handler for unhandled or unexpected system exceptions.
     * Logs full stack traces for debugging while obscuring internal system details from clients.
     *
     * @param e the unexpected exception thrown during request processing
     * @return a 500 Internal Server Error wrapped in {@link ApiResponse}
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception e){
        log.error("Unhandled exception occurred during request processing:", e);

        ApiResponse<Void> response = new ApiResponse<>(500, "failure", null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * Handles type mismatches on request parameters (e.g., passing string text into a Date or Numeric parameter).
     * Provides tailored guidance for common custom types such as LocalDate.
     *
     * @param ex the exception thrown when parameter conversion fails
     * @return a 400 Bad Request containing parameter-specific error guidance
     */
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

    /**
     * Handles Jakarta validation constraint failures on controller method parameters (e.g., @Min, @Max, @Pattern).
     *
     * @param ex the constraint violation exception holding parameter error details
     * @return a 400 Bad Request returning the first failed constraint message
     */
    @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(
            jakarta.validation.ConstraintViolationException ex ) {

        String message = ex.getConstraintViolations().iterator().next().getMessage();

        ApiResponse<Void> response = new ApiResponse<>(400, message, null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles missing or malformed JSON request bodies (e.g., empty body or syntax errors in JSON).
     *
     * @param ex the exception thrown when the HTTP message cannot be read
     * @return a 400 Bad Request indicating the request body is missing or malformed
     */
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadable(
            org.springframework.http.converter.HttpMessageNotReadableException ex) {

        ApiResponse<Void> response = new ApiResponse<>(400, "Required request body is missing or malformed JSON.", null);
        return ResponseEntity.badRequest().body(response);
    }

}
