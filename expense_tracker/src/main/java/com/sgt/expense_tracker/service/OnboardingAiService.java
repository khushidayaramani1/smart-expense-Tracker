package com.sgt.expense_tracker.service;

import com.sgt.expense_tracker.Dto.OnboardingRequest;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class OnboardingAiService {

    private final ChatClient chatClient;
    private static final Logger logger = LoggerFactory.getLogger(OnboardingAiService.class);

    @Value("${spring.ai.google.genai.api-key:NOT_FOUND}")
    private String apiKey;

    public OnboardingAiService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    public String getBudgetSuggestion(OnboardingRequest req) {

        String prompt = """
                You are a personal finance advisor for Indian users.

                User details:
                - Monthly income: ₹%d
                - Fixed expenses (rent, EMI etc): %s
                - Food and dining: %s
                - Travel and commute: %s
                - Current monthly savings: %s
                - Savings goal: %s
                - Other expenses: %s

                Based on this suggest a realistic monthly budget split.

                Rules:
                - All amounts in INR rupees
                - Total of all budgets must not exceed monthly income
                - Savings target must be realistic given their income
                - Use simple category names Indians relate to
                - Pick a relevant emoji for each category

                Reply ONLY in this exact JSON. No explanation. No extra text. Only JSON:
                {
                  "categories": [
                    { "categoryName": "Rent", "icon": "🏠", "type": "expense", "budget": 12000 },
                    { "categoryName": "Food", "icon": "🍔", "type": "expense", "budget": 5000 }
                  ],
                  "monthlySavingsTarget": 12000,
                  "advice": "One short actionable tip"
                }
                """.formatted(
                req.getMonthlyIncome(),
                req.getFixedExpenses(),
                req.getFoodSpending(),
                req.getTravelSpending(),
                req.getCurrentSavings(),
                req.getSavingsGoal(),
                req.getOtherExpenses()
        );

        logger.info("API key starts with: {}", apiKey.substring(0, 6));

        try {
            String result = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
            logger.info("AI response received: {}", result);
            return result;
        } catch (Exception e) {
            logger.error("Full AI error: ", e);
            throw e;
        }
    }
}