package com.gurujadhav.com.gurujadhav.atomurl.admin;

import com.gurujadhav.com.gurujadhav.atomurl.common.BaseApiException;
import com.gurujadhav.com.gurujadhav.atomurl.jwt.InvalidTokenException;
import com.gurujadhav.com.gurujadhav.atomurl.jwt.JwtService;
import com.gurujadhav.com.gurujadhav.atomurl.user.User;
import com.gurujadhav.com.gurujadhav.atomurl.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    @Autowired
    private AdminService adminService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new BaseApiException(HttpStatus.UNAUTHORIZED, "Authentication token required");
        }

        String token = authHeader.substring(7);
        if (!jwtService.isTokenValid(token)) {
            throw new InvalidTokenException("Invalid or expired JWT token");
        }

        Long userId = jwtService.extractUserId(token);
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new BaseApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        Integer tokenVersion = jwtService.extractTokenVersion(token);
        int expectedVersion = user.getTokenVersion() != null ? user.getTokenVersion() : 1;
        int actualVersion = tokenVersion != null ? tokenVersion : 1;
        if (actualVersion != expectedVersion) {
            throw new InvalidTokenException("Invalid or expired JWT token");
        }

        if (!adminService.isAdmin(user.getEmail())) {
            throw new BaseApiException(HttpStatus.FORBIDDEN, "Access denied: Administrator privileges required");
        }

        return true;
    }
}
