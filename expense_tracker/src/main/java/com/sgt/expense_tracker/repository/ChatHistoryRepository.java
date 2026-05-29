package com.sgt.expense_tracker.repository;

import com.sgt.expense_tracker.model.ChatHistory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ChatHistoryRepository {

    private final JdbcTemplate jdbcTemplate;

    public ChatHistoryRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Session ki saari messages fetch karo (chronological order)
    public List<ChatHistory> findBySessionId(String sessionId) {
        String sql = "SELECT * FROM chat_history WHERE session_id = ? ORDER BY created_at ASC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            ChatHistory ch = new ChatHistory();
            ch.setId(rs.getLong("id"));
            ch.setSessionId(rs.getString("session_id"));
            ch.setUsername(rs.getString("username"));
            ch.setRole(rs.getString("role"));
            ch.setContent(rs.getString("content"));
            ch.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            return ch;
        }, sessionId);
    }

    // Naya message save karo
    public void save(ChatHistory chatHistory) {
        String sql = "INSERT INTO chat_history (session_id, username, role, content) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql,
                chatHistory.getSessionId(),
                chatHistory.getUsername(),
                chatHistory.getRole(),
                chatHistory.getContent());
    }

    // Purani history delete karo (optional cleanup)
    public void deleteBySessionId(String sessionId) {
        String sql = "DELETE FROM chat_history WHERE session_id = ?";
        jdbcTemplate.update(sql, sessionId);
    }
}