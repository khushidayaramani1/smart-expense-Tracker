package com.sgt.expense_tracker.model;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
public class Transaction {
    private int transactionId;
    private BigDecimal amount;
    private Date dateOfTransaction;
    private String notes;
    private int categoryId;
    private int userId;
    private int activeYn;
    private String categoryName;
    private String type; // INCOME or EXPENSE

    public int getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(int transactionId) {
        this.transactionId = transactionId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Date getDateOfTransaction() {
        return dateOfTransaction;
    }

    public void setDateOfTransaction(Date dateOfTransaction) {
        this.dateOfTransaction = dateOfTransaction;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public int getActiveYn() {
        return activeYn;
    }

    public void setActiveYn(int activeYn) {
        this.activeYn = activeYn;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }


}