package com.gurujadhav.com.gurujadhav.atomurl.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import com.gurujadhav.cacheclient.CacheClient;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Component 
@Slf4j 
public class RateLimitInterceptor implements HandlerInterceptor {
    
    @Autowired 
    private CacheClient cache;

    private String getClientIp(HttpServletRequest request){
        String xff = request.getHeader("X-Forwarded-For");
        if(xff != null && !xff.isBlank()){
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        
        // not an api endpoint - static resource
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }
        
        RateLimit rateLimit = handlerMethod.getMethodAnnotation(RateLimit.class);

        // if method is not annotated with @RateLimit, then we apply the
        // default limits
        int limit = 60;
        int duration = 60;
        String message = "Too many requests.";

        if(rateLimit != null){
            limit = rateLimit.limit();
            duration = rateLimit.duration();
            message = rateLimit.message();
        }

        String clientIp = getClientIp(request);
        String key = "RL:" + request.getMethod() + ":" + request.getRequestURI() + ":" + clientIp;
        long currentCount = 0;
        
        try {
            currentCount = cache.INCR(2, key);
    
            if(currentCount == 1){
                cache.EXPIRE(2, key, duration);
            }
        } catch (Exception e) {
            log.error("CacheCore rate limit check failed: {}", e.getMessage());
            return true;
        }
        
        if(currentCount > limit){
            throw new RateLimitException(message + " Try after " + 
                        duration + " seconds.");
        }

        return true;
    }
}