package com.sgt.expense_tracker.repository;

import com.sgt.expense_tracker.model.LineChart;
import com.sgt.expense_tracker.model.PieChart;
import com.sgt.expense_tracker.model.SavingsChart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ChartRepo {

    @Autowired
    JdbcTemplate jdbcTemplate;

    //category wise income
    public List<PieChart> getIncomePieChartData(int userId){

        String sql = "select c.categoryName as Category,sum(t.amount) as Amount\n" +
                "from category c\n" +
                "join transaction t\n" +
                "on c.categoryId = t.categoryId\n" +
                "where c.type = 'INCOME'\n" +
                "and c.userId = ?\n" +
                "group by c.categoryName;";
        return jdbcTemplate.query(sql,(rs,rowNum)->{
            PieChart pieChart = new PieChart();
            pieChart.setAmount(rs.getInt("Amount"));
            pieChart.setCategory(rs.getString("Category"));
            return pieChart;
        },userId);
    }

    //    category wise expense
    public List<PieChart> getExpensePieChartData(int userId){

        String sql = "select c.categoryName as Category,sum(t.amount) as Amount\n" +
                "from category c\n" +
                "join transaction t\n" +
                "on c.categoryId = t.categoryId\n" +
                "where c.type = 'EXPENSE'\n" +
                "and c.userId = ?\n" +
                "group by c.categoryName;";
        return jdbcTemplate.query(sql,(rs,rowNum)->{
            PieChart pieChart = new PieChart();
            pieChart.setAmount(rs.getInt("Amount"));
            pieChart.setCategory(rs.getString("Category"));
            return pieChart;
        },userId);
    }
    //   line chart expense data
    public List<LineChart> lineChartExpenseData(int userId){
        String sql = "SELECT \n" +
                "    DATE_FORMAT(dateOfTransaction, '%b %Y') AS month_year, \n" +
                "    SUM(CASE WHEN c.type='EXPENSE' THEN amount ELSE 0 END) AS expense ,\n" +
                "    SUM(CASE WHEN c.type='INCOME' THEN amount ELSE 0 END) AS income \n" +
                "FROM transaction t \n" +
                "INNER JOIN category c ON t.categoryId = c.categoryId \n" +
                "WHERE t.userId = ?\n" +
                "  AND dateOfTransaction >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR) \n" +
                "  AND c.type = 'EXPENSE' \n" +
                "GROUP BY month_year, YEAR(dateOfTransaction), MONTH(dateOfTransaction) -- Grouping add ki hai\n" +
                "ORDER BY YEAR(dateOfTransaction) ASC, MONTH(dateOfTransaction) ASC;";

        return jdbcTemplate.query(sql,(rs,rowNum)->{
            LineChart lineChart = new LineChart();
            lineChart.setMonthYear(rs.getString("month_year"));
            lineChart.setExpense(rs.getInt("expense"));
            lineChart.setIncome(rs.getInt("income"));
            return lineChart;
        },userId);
    }
    //   line chart savings data
    public List<SavingsChart> lineChartSavingsData(int userId){
        String sql = "select date_format(dateOfTransaction,'%b %Y') as month_year , \n" +
                "sum(CASE WHEN c.type='income' THEN amount ELSE 0 END) -\n" +
                "sum(CASE WHEN c.type='expense' THEN amount ELSE 0 END) as savings \n" +
                "from Transaction t \n" +
                "inner join category c on t.categoryId=c.categoryId\n" +
                "where dateOfTransaction >= DATE_SUB(curdate(),INTERVAL 1 YEAR) and c.type='expense' and c.userId=?\n" +
                "group by month_year,YEAR(dateOfTransaction) , MONTH(dateOfTransaction)\n" +
                "order by YEAR(dateOfTransaction) ASC, MONTH(dateOfTransaction) ASC;";

        return jdbcTemplate.query(sql,(rs,rowNum)->{
            SavingsChart savingsChart = new SavingsChart();
            savingsChart.setSaving(rs.getInt("savings"));
            savingsChart.setMonthYear(rs.getString("month_year"));
            return savingsChart;
        },userId);
    }
    public void stackedBarChart(){

    }
}
