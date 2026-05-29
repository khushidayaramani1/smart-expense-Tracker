import com.sgt.expense_tracker.model.Transaction;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class TransactionMapper implements RowMapper<Transaction> {
    @Override
    public Transaction mapRow(ResultSet rs, int rowNum) throws SQLException {
        Transaction transaction = new Transaction();

        // 1. Transaction ID (DB screenshot me 'transactionId' hai)
        transaction.setTransactionId(rs.getInt("transactionId"));

        // 2. User ID (DB screenshot me 'userId' hai)
        transaction.setUserId(rs.getInt("userId"));

        // 3. Amount
        transaction.setAmount(rs.getBigDecimal("amount"));

        // 4. Category ID (DB screenshot me 'categoryId' hai)
        transaction.setCategoryId(rs.getInt("categoryId"));

        // 5. Notes
        transaction.setNotes(rs.getString("notes"));

        // 6. Date Conversion (sql.Date to LocalDate)
        java.sql.Date sqlDate = rs.getDate("dateOfTransaction");
        if (sqlDate != null) {
            transaction.setDateOfTransaction(sqlDate);
        }

        // 7. Active Status
        transaction.setActiveYn(rs.getInt("active_yn"));

        // 8. Jo humne JOIN se category name nikala tha
        // Query me humne 'c.categoryName' select kiya tha
        transaction.setCategoryName(rs.getString("categoryName"));

        // Agar aapne SQL me type bhi select kiya hai:
        // transaction.setCategoryType(rs.getString("type"));

        return transaction;
    }
}