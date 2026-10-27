package com.gurujadhav.com.gurujadhav.atomurl.email;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.from:atomurl.app@gmail.com}")
    private String fromEmail;

    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "[atomURL] Verification code: " + otp;
        String sender = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "atomurl.app@gmail.com";
        String htmlBody = buildOtpHtmlTemplate(otp);
        String plainText = buildOtpPlainText(otp);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(new InternetAddress(sender, "atomURL", "UTF-8"));
            helper.setReplyTo(new InternetAddress(sender, "atomURL Support", "UTF-8"));
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(plainText, htmlBody);

            mailSender.send(mimeMessage);
            log.info("HTML OTP verification email successfully dispatched to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send HTML OTP email to {}: {}. Falling back to plain text.", toEmail, e.getMessage());
            sendEmail(toEmail, subject, plainText);
        }
    }

    @Async
    public void sendEmail(String email, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setSubject(subject);
            message.setText(body);
            message.setTo(email);

            String sender = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "atomurl.app@gmail.com";
            message.setFrom(sender);
            message.setReplyTo(sender);

            mailSender.send(message);
            log.info("Email successfully dispatched to {}", email);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", email, e.getMessage(), e);
        }
    }

    private String buildOtpPlainText(String otp) {
        return "Hi,\n\n"
             + "You are receiving this email to verify your identity on atomURL.\n\n"
             + "Your verification code is: " + otp + "\n\n"
             + "Enter this code on the screen where you started. The code is valid for 5 minutes.\n\n"
             + "If you didn't request this verification code, you can safely ignore this email.\n\n"
             + "atomURL — Fast URL Shortener & Click Analytics\n"
             + "Contact: atomurl.app@gmail.com\n";
    }

    private String buildOtpHtmlTemplate(String otp) {
        return "<!DOCTYPE html>\n"
             + "<html lang=\"en\">\n"
             + "<head>\n"
             + "  <meta charset=\"UTF-8\">\n"
             + "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"
             + "  <title>atomURL Verification Code</title>\n"
             + "</head>\n"
             + "<body style=\"margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;\">\n"
             + "  <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #f8fafc; padding: 40px 16px;\">\n"
             + "    <tr>\n"
             + "      <td align=\"center\">\n"
             + "        <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width: 500px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);\">\n"
             + "          <tr>\n"
             + "            <td height=\"4\" style=\"background: linear-gradient(90deg, #10b981 0%, #6366f1 100%); line-height: 4px; font-size: 4px;\">\n"
             + "            </td>\n"
             + "          </tr>\n"
             + "          <tr>\n"
             + "            <td style=\"padding: 36px 32px 28px 32px;\">\n"
             + "              <div style=\"text-align: center; margin-bottom: 28px;\">\n"
             + "                <span style=\"font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;\">\n"
             + "                  atom<span style=\"color: #10b981;\">URL</span>\n"
             + "                </span>\n"
             + "              </div>\n"
             + "              <h1 style=\"margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a; text-align: center;\">\n"
             + "                Verification code\n"
             + "              </h1>\n"
             + "              <p style=\"margin: 0 0 12px 0; font-size: 15px; line-height: 24px; color: #475569;\">\n"
             + "                Hi,\n"
             + "              </p>\n"
             + "              <p style=\"margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #475569;\">\n"
             + "                You are receiving this email to verify your email address on <strong>atomURL</strong>. Enter the verification code below to proceed:\n"
             + "              </p>\n"
             + "              <div style=\"background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px 16px; text-align: center; margin: 0 0 20px 0; cursor: pointer; user-select: all; -webkit-user-select: all;\">\n"
             + "                <div style=\"font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #0f172a; text-indent: 10px; user-select: all; -webkit-user-select: all;\">\n"
             + "                  " + otp + "\n"
             + "                </div>\n"
             + "              </div>\n"
             + "              <p style=\"margin: 0 0 8px 0; font-size: 14px; line-height: 20px; color: #64748b; text-align: center;\">\n"
             + "                The code is valid for <strong>5 minutes</strong>.\n"
             + "              </p>\n"
             + "              <p style=\"margin: 0 0 24px 0; font-size: 13px; line-height: 18px; color: #94a3b8; text-align: center;\">\n"
             + "                If you didn't request this verification code, you can safely ignore this email.\n"
             + "              </p>\n"
             + "              <div style=\"border-top: 1px solid #f1f5f9; margin: 24px 0 20px 0;\"></div>\n"
             + "              <table width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\n"
             + "                <tr>\n"
             + "                  <td align=\"center\" style=\"font-size: 12px; line-height: 18px; color: #94a3b8;\">\n"
             + "                    <p style=\"margin: 0 0 6px 0;\">atomURL &bull; Fast URL Shortener &amp; Click Analytics</p>\n"
             + "                    <p style=\"margin: 0;\">Need help or have questions? Contact us at <a href=\"mailto:atomurl.app@gmail.com\" style=\"color: #10b981; text-decoration: none; font-weight: 500;\">atomurl.app@gmail.com</a></p>\n"
             + "                  </td>\n"
             + "                </tr>\n"
             + "              </table>\n"
             + "            </td>\n"
             + "          </tr>\n"
             + "        </table>\n"
             + "      </td>\n"
             + "    </tr>\n"
             + "  </table>\n"
             + "</body>\n"
             + "</html>";
    }
}
