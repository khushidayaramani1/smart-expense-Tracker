package com.sgt.expense_tracker.config;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.sgt.expense_tracker.Dto.TransactionDto;
import com.sgt.expense_tracker.model.User;
import com.sgt.expense_tracker.repository.AuthRepository;
import com.sgt.expense_tracker.repository.CategoryRepo;
import com.sgt.expense_tracker.service.TransactionService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import java.math.BigDecimal;
import com.sgt.expense_tracker.model.Category;
import com.sgt.expense_tracker.model.User;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component // 1. Isko Bean ke badle standard Component rakhein
public class AIToolsConfig {

    public static class TransactionRequest {
        public Double amount;
        public String category;
        public String notes;
        public String date;

        // Getters and Setters agar aapne pehle lagaye the
        public Double getAmount() { return amount; }
        public String getCategory() { return category; }
        public String getNotes() { return notes; }
        public String getDate() { return date; }
    }

    private final TransactionService transactionService;
    private final AuthRepository authRepository;
    private final CategoryRepo categoryRepo;

    public AIToolsConfig(TransactionService transactionService, AuthRepository authRepository, CategoryRepo categoryRepo) {
        this.transactionService = transactionService;
        this.authRepository = authRepository;
        this.categoryRepo = categoryRepo;
    }

    // 2. Ise direct @Tool banayein jise controller .tools("saveExpenseTool") se dhoond sake
    @Tool(name = "saveExpenseTool", description = "Saves a new expense transaction. Call this when user wants to log, save, or add an expense.")
    public String saveExpenseTool(TransactionRequest request) {
        try {
            System.out.println("=== TOOL CALLED ===");
            System.out.println("Amount: " + request.getAmount());
            System.out.println("Category: " + request.getCategory());
            System.out.println("Date: " + request.getDate());

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = (auth != null) ? auth.getName() : "anonymous";
            System.out.println("Username: " + username);

            Integer categoryId = categoryRepo.findCategoryIdByCategoryName(request.getCategory());
            System.out.println("CategoryId found: " + categoryId);

            if (categoryId == null) {
                return "Error: Category '" + request.getCategory() + "' not found.";
            }

            TransactionDto dto = new TransactionDto();
            dto.setAmount((int) Math.round(request.getAmount()));
            dto.setCategoryId(categoryId);
            dto.setNote(request.getNotes() != null ? request.getNotes() : request.getCategory());
// saveExpenseTool mein date set karne se pehle yeh add karo:
            String dateStr = request.getDate();
            if (dateStr == null || dateStr.equalsIgnoreCase("today") || dateStr.equalsIgnoreCase("now")) {
                dateStr = java.time.LocalDate.now().toString();
            }
            dto.setDateOfTransaction(dateStr);
            transactionService.addTransaction(dto, username);
            System.out.println("=== TRANSACTION SAVED ===");
            return "Success: Logged expense of ₹" + request.getAmount() + " for " + request.getCategory();

        } catch (Exception e) {
            System.out.println("=== TOOL ERROR: " + e.getMessage() + " ===");
            return "Error: " + e.getMessage();
        }
    }
    // ==================== TOOL 3: SPENDING ANALYSIS ====================
    @Tool(name = "getSpendingAnalysis", description = "Analyzes how much user has spent. Call this when user asks 'kitna kharch hua', 'spending summary', 'how much did I spend', or asks about a specific category's spending.")
    public String getSpendingAnalysis() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            List<TransactionDto> transactions = transactionService.getAllTransactions(username);
            if (transactions == null || transactions.isEmpty()) {
                return "no transactions found";
            }

            // Category wise total nikalo
            Map<Integer, Integer> categoryTotals = new HashMap<>();
            for (TransactionDto t : transactions) {
                categoryTotals.merge(t.getCategoryId(), t.getAmount(), Integer::sum);
            }

            // Total spending
            int totalSpent = categoryTotals.values().stream().mapToInt(Integer::intValue).sum();

            StringBuilder result = new StringBuilder();
            result.append("📊 your Spending Summary:\n");
            result.append("Total Spent: ₹").append(totalSpent).append("\n\n");
            result.append("Category-wise Breakdown:\n");

            categoryTotals.forEach((categoryId, total) -> {
                result.append("• Category ").append(categoryRepo.findCategoryById(categoryId).getCategoryName())
                        .append(": ₹").append(total).append("\n");
            });

            return result.toString();

        } catch (Exception e) {
            return "Error fetching spending data: " + e.getMessage();
        }
    }

    // ==================== TOOL 4: BUDGET ALERT ====================
    @Tool(name = "checkBudgetStatus", description = "Checks if user is close to or has exceeded budget for any category. Call this when user asks 'budget kaisa hai', 'kya budget cross hua', 'remaining budget', or 'am I overspending'.")
    public String checkBudgetStatus() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            User user = authRepository.findUserByUsername(username);
            if (user == null) return "User not found.";

            List<Category> categories = categoryRepo.findAllByUserId(user.getId());
            if (categories == null || categories.isEmpty()) {
                return "Koi categories nahi mili.";
            }

            StringBuilder result = new StringBuilder();
            result.append("💰 Budget Status:\n\n");

            boolean anyAlert = false;

            for (Category cat : categories) {
                if (cat.getTotalBudget() <= 0) continue; // Budget set nahi hai toh skip

                int spent = cat.getSpent();
                int total = cat.getTotalBudget();
                int remaining = total - spent;
                double percentage = ((double) spent / total) * 100;

                if (percentage >= 90) {
                    result.append("🔴 ").append(cat.getCategoryName())
                            .append(": ₹").append(spent).append(" / ₹").append(total)
                            .append(" (").append(String.format("%.0f", percentage)).append("% used) — DANGER!\n");
                    anyAlert = true;
                } else if (percentage >= 70) {
                    result.append("🟡 ").append(cat.getCategoryName())
                            .append(": ₹").append(spent).append(" / ₹").append(total)
                            .append(" (").append(String.format("%.0f", percentage)).append("% used) — Warning\n");
                    anyAlert = true;
                } else {
                    result.append("🟢 ").append(cat.getCategoryName())
                            .append(": ₹").append(spent).append(" / ₹").append(total)
                            .append(" (").append(String.format("%.0f", percentage)).append("% used) — Safe\n");
                }
            }

            if (!anyAlert) {
                result.append("Sab categories mein budget safe hai! 👍");
            }

            return result.toString();

        } catch (Exception e) {
            return "Error checking budget: " + e.getMessage();
        }
    }

    // ==================== TOOL 5: FINANCIAL ADVICE ====================
    @Tool(name = "getFinancialAdvice", description = "ALWAYS call this tool when user asks for financial advice, spending tips, or suggestions. This tool analyzes actual transaction data from database and returns personalized advice.")    public String getFinancialAdvice() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            List<TransactionDto> transactions = transactionService.getAllTransactions(username);
            if (transactions == null || transactions.isEmpty()) {
                return "Abhi tak koi transactions nahi hain. Pehle kuch expenses log karo!";
            }

            // Last 30 days ki transactions filter karo
            LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
            Map<Integer, Integer> recentSpending = new HashMap<>();

            for (TransactionDto t : transactions) {
                try {
                    LocalDate txnDate = LocalDate.parse(t.getDateOfTransaction());
                    if (!txnDate.isBefore(thirtyDaysAgo)) {
                        recentSpending.merge(t.getCategoryId(), t.getAmount(), Integer::sum);
                    }
                } catch (Exception ignored) {}
            }

            if (recentSpending.isEmpty()) {
                return "No transaction found in last 30 days";
            }

            // Sabse zyada spending wali category
            int topCategoryId = recentSpending.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .get().getKey();
            int topAmount = recentSpending.get(topCategoryId);
            int totalRecent = recentSpending.values().stream().mapToInt(Integer::intValue).sum();
            double topPercentage = ((double) topAmount / totalRecent) * 100;

            StringBuilder advice = new StringBuilder();
            advice.append("📈 last 30 Day's Financial Analysis:\n\n");
            advice.append("Total Spent: ₹").append(totalRecent).append("\n");
            advice.append("majority spending: Category-").append(topCategoryId)
                    .append(" pe ₹").append(topAmount)
                    .append(" (").append(String.format("%.0f", topPercentage)).append("%)\n\n");

            advice.append("💡 Suggestions:\n");

            if (topPercentage > 50) {
                advice.append("• Category-").append(topCategoryId)
                        .append(" pe aapka ").append(String.format("%.0f", topPercentage))
                        .append("% budget ja raha hai. Isko reduce karne ki koshish karo.\n");
            }
            if (totalRecent > 20000) {
                advice.append("• Is mahine overall spending thodi zyada lag rahi hai. Budget set karna helpful rahega.\n");
            }
            if (recentSpending.size() == 1) {
                advice.append("• Sirf ek category track ho rahi hai. Zyada categories add karo better analysis ke liye.\n");
            }

            advice.append("• Regular expense logging se better financial decisions liye ja sakte hain! 💪");

            return advice.toString();

        } catch (Exception e) {
            return "Error generating advice: " + e.getMessage();
        }
    }
}