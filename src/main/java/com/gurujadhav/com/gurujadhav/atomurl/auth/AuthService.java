package com.gurujadhav.com.gurujadhav.atomurl.auth;

import com.gurujadhav.cacheclient.CacheClient;
import com.gurujadhav.com.gurujadhav.atomurl.common.RateLimitException;
import com.gurujadhav.com.gurujadhav.atomurl.utils.OTPGenerator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
public class AuthService {

    @Autowired
    CacheClient cache;

    // TODO - configure CacheCore DB[1] for default expiry time of 2 minutes
    private  boolean checkOtpAlreadySent(EmailDto email){
        try {
            Optional<String> opt = cache.GET(1, email.getEmail(), String.class);
            return opt.isPresent();
        } catch (Exception ex) {
            String message = ex.getMessage();
            log.error("Error while getting OTP from cache : {}", message);
            return false;
        }
    }

    public void sendOtp(EmailDto email) {

        if(checkOtpAlreadySent(email)){
            throw new RateLimitException("OTP Already Sent, Please Try again later");
        }

        String OTP = OTPGenerator.generateOTP();
        try {
            cache.SET(1, email.getEmail(), OTP);
            // we need to call the email service here
            return;
        } catch (Exception e) {
            String message = e.getMessage();
            log.error("Error while putting OTP to the cache {}", message);
        }

        throw new RuntimeException("Error while sending OTP, Please Try again later.");
    }

    public String validateOtp(OtpValidationDto otpValidation)  {
        String email = otpValidation.getEmail();
        String otp = otpValidation.getOtp();

        /*
         * we need to check if user is already registered
         * - there is no actual difference in the flow of otp sending
         * we just need to send different user message like,
         * but we don't have to do that in this service we need to do that
         * in login service - the verify opt thing
         *
         * - we need to check if we have valid OPT against this email in the
         * store - if yes only then we validate it else return false - not active opt
         *
         * - but this OTP verification is single point of failure
         * we have no backup from where we can validate the OTP
         *
         * - so should we maintain a unordered map in memory so that we have a backup
         * but that will blot too much without clean up
         *
         * */

        Optional<String> otpInCache ;
        try {
            otpInCache = cache.GET(1, email, String.class);
        } catch (Exception ex) {
            String message = ex.getMessage();
            log.error("Error while validating OTP from cache : {}", message);
            throw new RuntimeException("Internal server error");
        }


        if(otpInCache.isEmpty() || !otpInCache.get().equals(otp)){
            throw  new InvalidOtpException("Invalid or expired OTP");
        }

        try {
            cache.DEL(1, email);
        }catch (Exception ignored) {}

        // TODO - generate real JWT token and return to the user
        return "token";
    }

}
