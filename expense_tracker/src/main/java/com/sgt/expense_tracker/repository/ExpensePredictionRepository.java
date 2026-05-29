package com.sgt.expense_tracker.repository;

import com.sgt.expense_tracker.model.ExpensePrediction;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class ExpensePredictionRepository {

    private final JdbcTemplate jdbcTemplate;

    public ExpensePredictionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // 1. Data Fetch karne ke liye (RowMapper ke saath)
    public List<ExpensePrediction> findByUsernameAndIsProcessedFalse(String username) {
        String sql = "SELECT * FROM expense_predictions WHERE username = ? AND is_processed = false";

        return jdbcTemplate.query(sql, new RowMapper<ExpensePrediction>() {
            @Override
            public ExpensePrediction mapRow(ResultSet rs, int rowNum) throws SQLException {
                ExpensePrediction prediction = new ExpensePrediction();
                prediction.setId(rs.getLong("id"));
                prediction.setUsername(rs.getString("username"));
                prediction.setAmount(rs.getDouble("amount"));
                prediction.setCategoryName(rs.getString("category_name"));
                prediction.setMessage(rs.getString("message"));
                prediction.setPredictedDate(rs.getDate("predicted_date").toLocalDate());
                prediction.setProcessed(rs.getBoolean("is_processed"));
                return prediction;
            }
        }, username);
    }

    // 2. Data Save karne ke liye (Scheduler use karega)
    public void save(ExpensePrediction prediction) {
        String sql = "INSERT INTO expense_predictions (username, amount, category_name, message, predicted_date, is_processed) VALUES (?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql,
                prediction.getUsername(),
                prediction.getAmount(),
                prediction.getCategoryName(),
                prediction.getMessage(),
                prediction.getPredictedDate(),
                prediction.isProcessed());
    }
    // 3. Prediction ko processed mark karna (approve ya reject dono ke liye)
    public void markAsProcessed(Long id) {
        String sql = "UPDATE expense_predictions SET is_processed = true WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }
    public boolean existsForUserAndCategoryThisMonth(String username, int categoryId, int month, int year) {
        String sql = "SELECT COUNT(*) FROM expense_predictions " +
                "WHERE username = ? AND category_name = ? " +
                "AND MONTH(predicted_date) = ? AND YEAR(predicted_date) = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class,
                username, "Category-" + categoryId, month, year);
        return count != null && count > 0;
    }
}