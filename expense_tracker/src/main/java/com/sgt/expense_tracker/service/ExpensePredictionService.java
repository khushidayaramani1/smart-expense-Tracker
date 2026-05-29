package com.sgt.expense_tracker.service;

import com.sgt.expense_tracker.Dto.TransactionDto;
import com.sgt.expense_tracker.model.ExpensePrediction;
import com.sgt.expense_tracker.repository.AuthRepository;
import com.sgt.expense_tracker.repository.ExpensePredictionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExpensePredictionService {

    private final ExpensePredictionRepository predictionRepository;
    private final TransactionService transactionService;
    private final AuthRepository authRepository;

    public ExpensePredictionService(
            ExpensePredictionRepository predictionRepository,
            TransactionService transactionService,
            AuthRepository authRepository) {
        this.predictionRepository = predictionRepository;
        this.transactionService = transactionService;
        this.authRepository = authRepository;
    }

    // Har din ek baar — midnight ko chalega
    @Scheduled(cron = "0 0 9 * * *")
    public void detectAndPredictRecurringExpenses() {
        System.out.println("Agentic AI: Scanning all users for recurring patterns...");

        // Saare registered users fetch karo
        List<String> allUsernames = authRepository.findAllUsernames();

        for (String username : allUsernames) {
            try {
                analyzeUserTransactions(username);
            } catch (Exception e) {
                System.out.println("Error analyzing user " + username + ": " + e.getMessage());
            }
        }
    }

    private void analyzeUserTransactions(String username) {
        List<TransactionDto> transactions = transactionService.getAllTransactions(username);
        if (transactions == null || transactions.isEmpty()) return;

        int today = LocalDate.now().getDayOfMonth();
        int currentMonth = LocalDate.now().getMonthValue();
        int currentYear = LocalDate.now().getYear();

        // Category ke hisaab se group karo
        Map<Integer, List<TransactionDto>> byCategory = transactions.stream()
                .collect(Collectors.groupingBy(TransactionDto::getCategoryId));

        for (Map.Entry<Integer, List<TransactionDto>> entry : byCategory.entrySet()) {
            int categoryId = entry.getKey();
            List<TransactionDto> categoryTxns = entry.getValue();

            // Check: Is category mein aaj ke date ke aaspaas (±2 days) last 2+ months mein transaction tha?
            long matchingMonths = categoryTxns.stream()
                    .filter(t -> {
                        try {
                            LocalDate txnDate = LocalDate.parse(t.getDateOfTransaction());
                            int dayDiff = Math.abs(txnDate.getDayOfMonth() - today);
                            boolean sameDay = dayDiff <= 2;
                            boolean pastMonth = txnDate.getMonthValue() != currentMonth
                                    || txnDate.getYear() != currentYear;
                            return sameDay && pastMonth;
                        } catch (Exception e) {
                            return false;
                        }
                    })
                    .map(t -> {
                        LocalDate d = LocalDate.parse(t.getDateOfTransaction());
                        return d.getYear() * 100 + d.getMonthValue(); // unique month key
                    })
                    .distinct()
                    .count();

            // 2+ alag months mein same date pe transaction → recurring pattern!
            if (matchingMonths >= 2) {
                // Kya is month already prediction exist karti hai?
                boolean alreadyExists = predictionRepository
                        .existsForUserAndCategoryThisMonth(username, categoryId, currentMonth, currentYear);

                if (!alreadyExists) {
                    // Average amount nikalo
                    double avgAmount = categoryTxns.stream()
                            .mapToInt(TransactionDto::getAmount)
                            .average()
                            .orElse(0);

                    ExpensePrediction prediction = new ExpensePrediction();
                    prediction.setUsername(username);
                    prediction.setAmount(avgAmount);
                    prediction.setCategoryName("Category-" + categoryId); // naam baad mein join se aa sakta hai
                    prediction.setPredictedDate(LocalDate.now());
                    prediction.setProcessed(false);
                    prediction.setMessage("Maine notice kiya ki aap har mahine is category mein ₹"
                            + (int) avgAmount + " spend karte ho. Kya aaj ka expense log kar doon?");

                    predictionRepository.save(prediction);
                    System.out.println("Prediction generated for: " + username + " | Category: " + categoryId);
                }
            }
        }
    }
}