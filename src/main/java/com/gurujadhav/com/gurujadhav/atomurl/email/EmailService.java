package com.gurujadhav.com.gurujadhav.atomurl.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendEmail(String email, String subject, String body) {
        try {

            SimpleMailMessage  message = new SimpleMailMessage();
            message.setSubject(subject);
            message.setText(body);
            message.setTo(email);
            message.setFrom("noreply@atomurl.com");

            mailSender.send(message);
        } catch (Exception e) {
            String message = e.getMessage();
            log.error(message);
        }
    }
}
