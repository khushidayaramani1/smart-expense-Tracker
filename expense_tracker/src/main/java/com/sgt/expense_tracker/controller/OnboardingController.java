package com.sgt.expense_tracker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sgt.expense_tracker.Dto.OnboardingRequest;
import com.sgt.expense_tracker.service.OnboardingAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingController {

    private final OnboardingAiService onboardingAiService;

    public OnboardingController(OnboardingAiService onboardingAiService) {
        this.onboardingAiService = onboardingAiService;
    }

    @PostMapping("/ai-suggest")
    public ResponseEntity<?> getAiSuggestion(@RequestBody OnboardingRequest request) {
        try {
            String aiResponse = onboardingAiService.getBudgetSuggestion(request);
            ObjectMapper mapper = new ObjectMapper();  // ← create directly here
            Object parsed = mapper.readValue(aiResponse, Object.class);
            return ResponseEntity.ok(parsed);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("AI suggestion failed: " + e.getMessage());
        }
    }
}