package com.sgt.expense_tracker.model;

import java.time.LocalDate;

public class ExpensePrediction {

    private Long id;
    private String username;
    private Double amount;
    private String categoryName;
    private String message;
    private LocalDate predictedDate;
    private boolean isProcessed;

    // No-Args Constructor (Default Constructor)
    public ExpensePrediction() {}

    // All-Args Constructor (Agar use karna chahein)
    public ExpensePrediction(Long id, String username, Double amount, String categoryName, String message, LocalDate predictedDate, boolean isProcessed) {
        this.id = id;
        this.username = username;
        this.amount = amount;
        this.categoryName = categoryName;
        this.message = message;
        this.predictedDate = predictedDate;
        this.isProcessed = isProcessed;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDate getPredictedDate() { return predictedDate; }
    public void setPredictedDate(LocalDate predictedDate) { this.predictedDate = predictedDate; }

    public boolean isProcessed() { return isProcessed; }
    public void setProcessed(boolean processed) { isProcessed = processed; }
}