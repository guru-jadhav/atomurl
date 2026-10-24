package com.gurujadhav.com.gurujadhav.atomurl.common;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {
    int limit() default 60;
    int duration() default 60;
    String message() default "Rate limit exceeded.";
}