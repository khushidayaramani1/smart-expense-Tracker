package com.sgt.expense_tracker.config;

import com.sgt.expense_tracker.JwtFilter;
import com.sgt.expense_tracker.service.CustomUserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.swing.*;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS explicitly enable karein
                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
                    corsConfiguration.setAllowedOrigins(List.of("http://localhost:5174","http://localhost:5173")); // Frontend URL
                    corsConfiguration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    corsConfiguration.setAllowedHeaders(List.of("*"));
                    corsConfiguration.setAllowCredentials(true);
                    return corsConfiguration;
                }))
                // 2. CSRF disable karein (JWT use kar rahe hain isliye zaroori hai)
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/authenticate", "/sign-up", "/resetPassword/**", "/add-category",
                                "/category-names", "/categories", "/error", "/user-by-id/**",
                                "/chart-info/**", "/transactions", "/filter-data", "/get-all-transaction",
                                "/budget-split/**", "/api/onboarding/**", "/chat",
                                "/api/predictions", "/api/predictions/**",
                                "/api/chat/session", "/api/chat/history/**").permitAll()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

//    DaoAuthenticationProvider banana: Ye wo component hai jo database se user dhoondne aur password check karne ka kaam karta hai. 🔍
//    setPasswordEncoder: Ye batata hai ki password ko check karte waqt kaunsa algorithm (jaise BCrypt) use karna hai. 🔐
//    ProviderManager: Ye ek list of providers ko manage karta hai aur final AuthenticationManager return karta hai.
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5174")); // Frontend URL
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true); // Ye sabse zaruri hai

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
//    Authentication Engine kaise kaam karta hai?Imagine kijiye aap ek VIP club mein entry chahte hain.
//    Wahan do main log hain:AuthenticationManager (The Head Guard): Yeh wo manager hai jiske paas saara authority hota hai. Jab aap login request bhejte hain,
//    toh yeh manager decide karta hai ki aapko entry milegi ya nahi. Lekin yeh manager khud checking nahi karta, yeh apne "Assistant" ko bulata hai.
//    📋DaoAuthenticationProvider (The Checker): Yeh wo assistant hai jise pata hai ki "checking" kaise karni hai.
//    Yeh aapka ID (Username/Email) leta hai, database se purana record nikalta hai, aur aapka password verify karta hai. 🔍🛠️
//    In Beans ka asli fayda kya hai?ComponentKya kaam karta hai?AuthenticationManagerYeh entry point hai.
//    Aapke Controller mein jab aap authenticate() call karenge, toh yahi bean use hoga. Yeh poore authentication process ko lead karta hai.
//    🏗️DaoAuthenticationProvider   Yeh specify karta hai ki hum Database (DAO) use kar rahe hain. Iske bina Spring Security ko nahi pata chalega ki use password check karne ke liye BCrypt use karna hai ya koi aur method.
//    🔐UserDetailsServiceYeh provider ko database se "User" fetch karke deta hai. Iske bina provider ko pata hi nahi chalega ki user exist karta bhi hai ya nahi.
//    🗄️🚀 SummaryIn do beans ko likhne ka matlab hai ki aap Spring Security ko bol rahe ho: "Bhai, jab koi login kare, toh mere 'CustomUserService' se data uthana, 'BCrypt' se password match karna, aur 'AuthenticationManager' ke through mujhe result batana."
}