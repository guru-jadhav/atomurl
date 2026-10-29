package com.gurujadhav.com.gurujadhav.atomurl.common;

import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import com.gurujadhav.com.gurujadhav.atomurl.jwt.InvalidTokenException;
import com.gurujadhav.com.gurujadhav.atomurl.jwt.JwtService;
import com.gurujadhav.com.gurujadhav.atomurl.user.User;
import com.gurujadhav.com.gurujadhav.atomurl.user.UserService;

@Component
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class)
                && parameter.getParameterType().equals(User.class);
    }

    @Override
    public @Nullable Object resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) throws Exception {

        String authHeader = webRequest.getHeader("Authorization");
        CurrentUser currentUser = parameter.getParameterAnnotation(CurrentUser.class);
        boolean isRequired = currentUser != null && currentUser.required();

        if (authHeader == null || authHeader.isBlank()) {
            if (isRequired) {
                throw new InvalidTokenException("401 : Unauthorized");
            }

            return null;
        }

        if (!authHeader.startsWith("Bearer ")) {
            throw new InvalidTokenException("Invalid or expired JWT token");
        }

        String token = authHeader.substring(7);
        Long userId = jwtService.extractUserId(token);
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired JWT token"));

        Integer tokenVersion = jwtService.extractTokenVersion(token);
        int expectedVersion = user.getTokenVersion() != null ? user.getTokenVersion() : 1;
        int actualVersion = tokenVersion != null ? tokenVersion : 1;
        if (actualVersion != expectedVersion) {
            throw new InvalidTokenException("Invalid or expired JWT token");
        }

        return user;
    }

}