package com.sgt.expense_tracker.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Random;

@Service
public class OtpService {

    @Value("${fast2sms.api.key}")
    private String apiKey;

    public String sendOtp(String phoneNumber) {
        String otp = generateOtp(); // 6-digit OTP generate kiya

        // Step 1: Phone number cleaning
        if(phoneNumber.startsWith("+91")) {
            phoneNumber = phoneNumber.replace("+91", "");
        }
        phoneNumber = phoneNumber.trim();

        try {
            // Step 2: URL Encoding (Safety ke liye)
            String urlString = "https://www.fast2sms.com/dev/bulkV2?authorization=" + apiKey +
                    "&route=otp&variables_values=" + otp +
                    "&numbers=" + phoneNumber;

            URL url = new URL(urlString);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("GET");
            con.setRequestProperty("cache-control", "no-cache");

            int responseCode = con.getResponseCode();

            if (responseCode == HttpURLConnection.HTTP_OK) {
                System.out.println("OTP Sent Successfully via Fast2SMS! Code: " + otp);
                return otp; // Yahan se seedha string return karo
            } else {
                // Check karein ki response code 400 hai ya kuch aur
                System.err.println("Fast2SMS Error. Response Code: " + responseCode);
                return null; // Failure case mein null bhejenge
            }

        } catch (Exception e) {
            System.err.println("Exception while sending SMS: " + e.getMessage());
            return null;
        }
    }

    public String generateOtp() {
        Random random = new Random();
        int otpValue = 100000 + random.nextInt(900000);
        return String.valueOf(otpValue);
    }
}