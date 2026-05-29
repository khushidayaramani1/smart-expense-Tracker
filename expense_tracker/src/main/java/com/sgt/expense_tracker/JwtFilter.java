package com.sgt.expense_tracker;

import com.sgt.expense_tracker.service.AuthService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    AuthService authService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws IOException, ServletException {

        String authHeader = request.getHeader("Authorization");
        String token = null;

        // 1. Check karo header hai ya nahi. Agar nahi hai, toh aage badho (Skip filter)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return; // Yahan se return karna zaruri hai taaki niche ka code na chale
        }

        // 2. Token extract karo
        token = authHeader.substring(7);

        // 3. Agar token "null" ya "undefined" string hai (frontend mistakes), toh bhi skip karo
        if (token.isEmpty() || token.equals("null") || token.equals("undefined")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                Claims claims = authService.verifySignatureAndExtractAllClaims(token);

                if (!authService.checkExpiration(token)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(claims.getSubject(), null, new ArrayList<>());

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }

            } catch (ExpiredJwtException e) {
                // Token expire ho gaya
                sendErrorResponse(response, "Token expired, please login again");
                return;
            } catch (MalformedJwtException e) {
                // Token ka format kharab hai (Ye wala error aa raha tha aapko)
                sendErrorResponse(response, "Invalid token format");
                return;
            } catch (Exception e) {
                // Koi aur error
                sendErrorResponse(response, "Authentication failed");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    // Helper method error message bhejne ke liye
    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"" + message + "\"}");
    }
}