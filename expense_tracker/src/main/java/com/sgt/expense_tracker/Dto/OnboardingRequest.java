package com.sgt.expense_tracker.Dto;

public class OnboardingRequest {
    private int monthlyIncome;
    private String fixedExpenses;
    private String foodSpending;
    private String travelSpending;
    private String currentSavings;
    private String savingsGoal;
    private String otherExpenses;

    public int getMonthlyIncome() { return monthlyIncome; }
    public void setMonthlyIncome(int monthlyIncome) { this.monthlyIncome = monthlyIncome; }

    public String getFixedExpenses() { return fixedExpenses; }
    public void setFixedExpenses(String fixedExpenses) { this.fixedExpenses = fixedExpenses; }

    public String getFoodSpending() { return foodSpending; }
    public void setFoodSpending(String foodSpending) { this.foodSpending = foodSpending; }

    public String getTravelSpending() { return travelSpending; }
    public void setTravelSpending(String travelSpending) { this.travelSpending = travelSpending; }

    public String getCurrentSavings() { return currentSavings; }
    public void setCurrentSavings(String currentSavings) { this.currentSavings = currentSavings; }

    public String getSavingsGoal() { return savingsGoal; }
    public void setSavingsGoal(String savingsGoal) { this.savingsGoal = savingsGoal; }

    public String getOtherExpenses() { return otherExpenses; }
    public void setOtherExpenses(String otherExpenses) { this.otherExpenses = otherExpenses; }
}