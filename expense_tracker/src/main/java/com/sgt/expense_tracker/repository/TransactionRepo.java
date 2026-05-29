package com.sgt.expense_tracker.repository;

import com.sgt.expense_tracker.Dto.CategoryDto;
import com.sgt.expense_tracker.Dto.TransactionDto;
import com.sgt.expense_tracker.model.Category;
import com.sgt.expense_tracker.model.Transaction;
import com.sgt.expense_tracker.model.User;
//import com.sgt.expense_tracker.rowmapper.TransactionMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class TransactionRepo {
    @Autowired
    JdbcTemplate jdbcTemplate;

    @Autowired
    AuthRepository authRepository;

    @Autowired
    CategoryRepo categoryRepo;

    private final Logger logger = LoggerFactory.getLogger(TransactionRepo.class);

    public List<Transaction> findAllByUserId(int userId) {
        String sql = "SELECT t.*, c.categoryName, c.type FROM transactions t " +
                "JOIN categories c ON t.categoryId = c.categoryId " +
                "WHERE t.userId = ? AND t.active_yn = 1 " +
                "ORDER BY t.dateOfTransaction DESC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Transaction t = new Transaction();
            t.setTransactionId(rs.getInt("transactionId"));
            t.setAmount(rs.getBigDecimal("amount"));
            t.setDateOfTransaction(rs.getDate("dateOfTransaction"));
            t.setNotes(rs.getString("notes"));
            t.setCategoryId(rs.getInt("categoryId"));
            t.setCategoryName(rs.getString("categoryName"));
            t.setType(rs.getString("type"));
            return t;
        }, userId);
    }

    public int addTransaction(TransactionDto transactionDto, String username) {
        User u = authRepository.findUserByUsername(username);
        String sql = "INSERT INTO transaction (amount, dateOfTransaction, notes, categoryId,  userId)\n" +
                "values(?,?,?,?,?)";
        int num = categoryRepo.updateAmount(transactionDto.getCategoryId(),transactionDto.getAmount());
        return jdbcTemplate.update(sql,transactionDto.getAmount(),
                transactionDto.getDateOfTransaction(), transactionDto.getNote(),
                transactionDto.getCategoryId(),u.getId());
    }



    public List<Map<String, Object>> getTransaction(String category, String date, String type, String note,
                                                    String amount, String amountOrder, String column, int userId) {
        StringBuilder query = new StringBuilder(
                "SELECT t.dateOfTransaction, c.categoryName, t.notes, t.amount " +
                        "FROM transaction t " +
                        "INNER JOIN category c ON t.categoryId = c.categoryId " +
                        "WHERE t.userId = ? "
        );
        List<Object> params = new ArrayList<>();
        params.add(userId);
        if (category != null && !category.isEmpty()) {
            query.append(" AND c.categoryName = ?"); // 'c' matlab category table
            params.add(category);
        }
        if (date != null && !date.isEmpty()) {
            query.append(" AND t.dateOfTransaction = ?"); // 't' matlab transaction table
            params.add(date);
        }
        if (type != null && !type.isEmpty()) {
            query.append(" AND c.type = ?");
            params.add(type);
        }
        if (note != null && !note.isEmpty()) {
            query.append(" AND t.notes LIKE ?");
            params.add("%" + note + "%");
        }
        if (amount != null && !amount.isEmpty()) {
            query.append(" AND t.amount = ?");
            params.add(amount);
        }
        // 3. Sorting logic (Agar aapne parameters mein amountOrder aur column bheja hai)
        if (column != null && !column.isEmpty()) {
            String sortCol = column.equals("amount") ? "t.amount" : "t.dateOfTransaction";
            String sortDir = (amountOrder != null && amountOrder.equalsIgnoreCase("DESC")) ? "DESC" : "ASC";
            query.append(" ORDER BY ").append(sortCol).append(" ").append(sortDir);
        }
        System.out.println("QUERY: " + query.toString());
        System.out.println("PARAMS: " + params);
        return jdbcTemplate.queryForList(query.toString(), params.toArray());
    }

    public List<TransactionDto> getAllTransactions(int userId) {
        // This fetches every row and the 4 specified columns
        String sql = "SELECT dateOfTransaction, notes, amount, categoryId FROM transaction where userId = ?";

        // .query() iterates through every row in the result set automatically
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            TransactionDto transaction = new TransactionDto();

            // Manual mapping for each row
            transaction.setDateOfTransaction(rs.getString("dateOfTransaction"));
            transaction.setNote(rs.getString("notes"));
            transaction.setAmount(rs.getInt("amount"));
            transaction.setCategoryId(rs.getInt("categoryId"));

            return transaction;
        },userId);
    }
}
