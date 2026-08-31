package com.gurujadhav.com.gurujadhav.atomurl.utils;

public class Base62 {

    private static final String ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    private static final int BASE = ALPHABET.length();

    public static String encode(long number){
        if(number == 0){
            return String.valueOf(ALPHABET.charAt(0));
        }

        StringBuilder sb = new StringBuilder();
        while(number > 0){
            int remainder = (int) (number % BASE);
            sb.append(ALPHABET.charAt(remainder));
            number /= BASE;
        }

        return sb.reverse().toString();
    }

    public static long decode(String shortCode){
        long number = 0;
        for(int i = 0; i < shortCode.length(); i++){
            char c = shortCode.charAt(i);
            int index = ALPHABET.indexOf(c);
            number = number * BASE + index;
        }

        return number;
    }
}
