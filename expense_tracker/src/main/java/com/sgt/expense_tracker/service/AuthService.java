package com.sgt.expense_tracker.service;

import com.sgt.expense_tracker.model.User;
import com.sgt.expense_tracker.repository.AuthRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    AuthRepository authRepo;

    @Value("${SECRET_KEY}")
    private String SECRET_KEY;

    private SecretKey getSignedKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    public String generateToken(String username){
        return Jwts.builder()
                .setSubject(username)
                .issuedAt(new Date())
                // Warning: Aapka expiration logic galat tha (bahut bada number ban raha tha)
                // Use this: Current Time + 30 minutes
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .addClaims(new HashMap<>())
                .signWith(getSignedKey()) // <--- YAHAN CHANGE KIYA (getSignedKey use karo)
                .compact();
    }

    public void saveUser(User user){
         authRepo.saveUser(user);
    }

    public boolean checkEmailExists(String email){
        Map<String,Object> map = authRepo.checkEmailExists(email);
        if(map==null){
            return false;
        }
        return true;
    }

    public boolean checkUsernameExists(String username){
        Map<String,Object> map = authRepo.checkUsernameExists(username);
        if(map==null){
            return false;
        }
        return true;
    }

    public Claims verifySignatureAndExtractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignedKey()) // <--- Ye ab match karega!
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

//    extract username from token
    public String extractUsername(String token){
        return verifySignatureAndExtractAllClaims(token).getSubject();
//        because setSubject me username store kia hai in generateToken method
    }

    public Date getExpirationDate(String token){
        //        because setExpiration in generateToken method
        return verifySignatureAndExtractAllClaims(token).getExpiration();
    }

// check expiration of the token
    public boolean checkExpiration(String token){
        return getExpirationDate(token).before(new Date());
    }

    public User findUserByEmail(String email){
        return authRepo.findUserByEmail(email);
    }
    public User findUserByPhoneNumber(String phoneNumber){
        return authRepo.findUserByPhoneNumber(phoneNumber);
    }

    public User findUserByUserId(int userId){
        return authRepo.findUserByUserId(userId);
    }
    public int updatePassword(User u ){
        String password = u.getPassword();
        int id = u.getId();
        return authRepo.updatePassword(password,id);
    }
    public User findUserByUsername(String username){
        return authRepo.findUserByUsername(username);
    }
}
