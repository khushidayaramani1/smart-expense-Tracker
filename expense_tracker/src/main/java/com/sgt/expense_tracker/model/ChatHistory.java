package com.sgt.expense_tracker.model;

import java.time.LocalDateTime;

public class ChatHistory {

    private Long id;
    private String sessionId;
    private String username;
    private String role; // "user" ya "assistant"
    private String content;
    private LocalDateTime createdAt;

    public ChatHistory() {}

    public ChatHistory(String sessionId, String username, String role, String content) {
        this.sessionId = sessionId;
        this.username = username;
        this.role = role;
        this.content = content;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}