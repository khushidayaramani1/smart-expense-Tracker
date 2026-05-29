package com.sgt.expense_tracker.model;

import java.util.List;

public class ChartDto {
    List<PieChart> pieChartExpenseList;
    List<PieChart> pieChartIncomeList;

    List<LineChart> lineChartList;
    List<SavingsChart> savingsChartList;

    public List<SavingsChart> getSavingsChartList() {
        return savingsChartList;
    }

    public void setSavingsChartList(List<SavingsChart> savingsChartList) {
        this.savingsChartList = savingsChartList;
    }

    public List<LineChart> getLineChartList() {
        return lineChartList;
    }

    public void setLineChartList(List<LineChart> lineChartList) {
        this.lineChartList = lineChartList;
    }

    public List<PieChart> getPieChartExpenseList() {
        return pieChartExpenseList;
    }

    public void setPieChartExpenseList(List<PieChart> piePieChartExpenseList) {
        this.pieChartExpenseList = piePieChartExpenseList;
    }

    public List<PieChart> getPieChartIncomeList() {
        return pieChartIncomeList;
    }

    public void setPieChartIncomeList(List<PieChart> piePieChartIncomeList) {
        this.pieChartIncomeList = piePieChartIncomeList;
    }
}
