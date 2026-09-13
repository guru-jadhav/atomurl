package com.gurujadhav.com.gurujadhav.atomurl.utils;

import java.security.SecureRandom;
import java.util.random.RandomGenerator;

public class OTPGenerator {

    private static final int length = 6;
    private static  final SecureRandom secureRandom = new SecureRandom();

    static public String generateOTP() {

        int number = secureRandom.nextInt(1_000_000);
        return String.format("%06d", number);
    }
}
