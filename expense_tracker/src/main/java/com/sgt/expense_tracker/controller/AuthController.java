package com.sgt.expense_tracker.controller;

import com.sgt.expense_tracker.model.OtpDetails;
import com.sgt.expense_tracker.model.User;
import com.sgt.expense_tracker.repository.OtpRepo;
import com.sgt.expense_tracker.service.AuthService;
import com.sgt.expense_tracker.service.EmailService;
import com.sgt.expense_tracker.service.OtpService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    @Autowired
    AuthService authService;
    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    OtpService otpService;
    @Autowired
    EmailService emailService; // Added
    @Autowired
    OtpRepo otpRepo;           // Added
    @Autowired
    JavaMailSender mailSender;
    private static final Logger log = Logger.getLogger(AuthController.class.getName());

    public boolean isValidEmail(String email) {
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email != null && email.matches(emailRegex);
    }
    @PostMapping("/sign-up")
    public ResponseEntity<?> signUp(@RequestBody User user){
        log.info("inside the sign up page");
        String email = user.getEmail();
        String username = user.getUsername();
        if(!isValidEmail(email)){
            return ResponseEntity.badRequest().body(Map.of("response","email regex invalid"));
        }
        if(authService.checkEmailExists(email)){
            return ResponseEntity.badRequest().body(Map.of("response","email already exists"));
        }
        if(authService.checkUsernameExists(username)){
            return ResponseEntity.badRequest().body(Map.of("response","username not available"));
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        authService.saveUser(user);
        String token = authService.generateToken(username);
        Map<String,Object> responseData = new HashMap<>();
        responseData.put("username",user.getUsername());
        responseData.put("token",token);
        responseData.put("userId",user.getId());
        responseData.put("message","sign up successfully");
        return ResponseEntity.ok().body(responseData);
    }

    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(@RequestBody Map<String,String> map) {
        try {
            String username = map.get("username");
            String password = map.get("password");
            Authentication authenticate = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username,password)
            );
            if(authenticate.isAuthenticated()){
                String token = authService.generateToken(username);
                User dbUser = authService.findUserByUsername(username);
                Map<String,Object> response = new HashMap<>();
                response.put("token", token);
                response.put("userId", dbUser.getId()); // Ab ID sahi milegi
                response.put("username", dbUser.getUsername());
                response.put("onboardingCompleted",dbUser.isOnboardingCompleted());
                response.put("message","login successfull");
                return ResponseEntity.ok(response);
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("response","login with correct credentials"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED    ).body(Map.of("response", e.getMessage()));
        }
    }

    @PostMapping("/resetPassword/{method}/{payload}")
    public ResponseEntity<?> resetPassword(@PathVariable("method") String method,
                                           @PathVariable("payload") String payload) {
        User u = null;
        String finalOtp = otpService.generateOtp(); // 6 digit unique code

        // 1. Find User & Send Logic
        if ("email".equals(method)) {
            u = authService.findUserByEmail(payload);
            if (u == null) return ResponseEntity.status(404).body(Map.of("response", "Email not found"));

            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);
                helper.setTo(payload);
                helper.setSubject("Reset Your Expense Tracker Password");

                // Frontend Link (Jahan user password change karega)
                // Hum OTP ko hi token ki tarah bhej rahe hain URL mein
                String resetLink = "http://localhost:5173/update-password?userId=" + u.getId();

                String htmlContent =
                        "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;'>" +
                                "<h2>Password Reset Request</h2>" +
                                "<p>Hi " + u.getName() + ",</p>" +
                                "<p>Click the button below to reset your password. This link is valid for 5 minutes.</p>" +
                                "<a href='" + resetLink + "' style='background: #00a884; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>Reset Password</a>" +
                                "<p style='margin-top: 20px; color: #888;'>If the button doesn't work, copy-paste this: " + resetLink + "</p>" +
                                "</div>";

                helper.setText(htmlContent, true);
                mailSender.send(message);
            } catch (MessagingException e) {
                return ResponseEntity.status(500).body(Map.of("response", "Email failed"));
            }
        }
        else { // PHONE LOGIC
            u = authService.findUserByPhoneNumber(payload);
            if (u == null) return ResponseEntity.status(404).body(Map.of("response", "Phone not found"));

            // SMS bhej rahe hain (Isme sirf OTP jayega, link nahi)
            otpService.sendOtp(payload); // Ensure this uses 'finalOtp' internally
        }

        // 2. Save to DB (Common for both)
        OtpDetails otpDetails = new OtpDetails();
        otpDetails.setOtpCode(finalOtp);
        otpDetails.setUserId(u.getId());
        otpDetails.setExpiry(new Date(System.currentTimeMillis() + 5 * 60 * 1000));
        otpRepo.saveOtp(otpDetails);

        return ResponseEntity.ok(Map.of("response", "Verification sent successfully"));
    }


    @PostMapping("/update-password/{userId}")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String,String> map,
                                            @PathVariable("userId") int userId){
        User u = authService.findUserByUserId(userId);
        if(u==null){
           return ResponseEntity.badRequest().body(Map.of("resposne","user not found"));
        }
        System.out.println("userpassword enterred is ----> "+map.get("password"));
        u.setPassword(passwordEncoder.encode(map.get("password")));
        authService.updatePassword(u);
        return ResponseEntity.ok().body(Map.of("response","updated password successfully"));
    }

    @GetMapping("/user-by-id/{userId}" )
    public ResponseEntity<?> findUserById(@PathVariable("userId") int userId){
        try{
            User u = authService.findUserByUserId(userId);
            Map<String,Object> response = new HashMap<>();
            response.put("username",u.getUsername());
            response.put("email",u.getEmail());
            response.put("phone",u.getPhone());
            return ResponseEntity.ok().body(response);
        }catch(Exception e){
           return ResponseEntity.badRequest().body(Map.of("response","could not fetch user"));
        }
    }
}