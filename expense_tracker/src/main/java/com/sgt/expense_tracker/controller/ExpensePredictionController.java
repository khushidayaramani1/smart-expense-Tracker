package com.sgt.expense_tracker.controller;



import com.sgt.expense_tracker.model.ExpensePrediction;
import com.sgt.expense_tracker.repository.ExpensePredictionRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class ExpensePredictionController {

    private final ExpensePredictionRepository predictionRepository;

    public ExpensePredictionController(ExpensePredictionRepository predictionRepository) {
        this.predictionRepository = predictionRepository;
    }

    // GET: Fetch all pending predictions for logged-in user
    @GetMapping("/predictions")
    public List<ExpensePrediction> getPendingPredictions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return predictionRepository.findByUsernameAndIsProcessedFalse(username);
    }

    // POST: User ne prediction approve ki → actual expense log karo
    @PostMapping("/predictions/{id}/approve")
    public String approvePrediction(@PathVariable Long id) {
        predictionRepository.markAsProcessed(id);
        return "Prediction approved and marked as processed.";
    }

    // POST: User ne prediction reject ki → sirf mark as processed
    @PostMapping("/predictions/{id}/reject")
    public String rejectPrediction(@PathVariable Long id) {
        predictionRepository.markAsProcessed(id);
        return "Prediction dismissed.";
    }
}