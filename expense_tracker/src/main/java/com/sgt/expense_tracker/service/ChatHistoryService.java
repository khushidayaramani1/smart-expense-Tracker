package com.sgt.expense_tracker.service;

import com.sgt.expense_tracker.model.ChatHistory;
import com.sgt.expense_tracker.repository.ChatHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatHistoryService {

    private final ChatHistoryRepository chatHistoryRepository;

    public ChatHistoryService(ChatHistoryRepository chatHistoryRepository) {
        this.chatHistoryRepository = chatHistoryRepository;
    }

    public List<ChatHistory> getHistoryBySessionId(String sessionId) {
        return chatHistoryRepository.findBySessionId(sessionId);
    }

    public void saveMessage(String sessionId, String username, String role, String content) {
        chatHistoryRepository.save(new ChatHistory(sessionId, username, role, content));
    }

    public void deleteSession(String sessionId) {
        chatHistoryRepository.deleteBySessionId(sessionId);
    }
}