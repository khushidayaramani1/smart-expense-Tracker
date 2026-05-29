package com.sgt.expense_tracker.repository;

import com.sgt.expense_tracker.model.OtpDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class OtpRepo {
    @Autowired
    JdbcTemplate jdbcTemplate;

    public int saveOtp(OtpDetails otp){
        // Parameter wala 'otp' object use karein, naya create na karein
        String sql = "insert into OtpDetails(otpCode, expiry, UserId) values (?, ?, ?);";
        return jdbcTemplate.update(sql, otp.getOtpCode(), otp.getExpiry(), otp.getUserId());
    }
}
