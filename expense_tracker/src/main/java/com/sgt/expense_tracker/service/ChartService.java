package com.sgt.expense_tracker.service;

import com.sgt.expense_tracker.model.LineChart;
import com.sgt.expense_tracker.model.PieChart;
import com.sgt.expense_tracker.model.SavingsChart;
import com.sgt.expense_tracker.repository.ChartRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChartService {

    @Autowired
    ChartRepo chartRepo;
    public List<PieChart> getIncomePieChartData(int userId){
        return chartRepo.getIncomePieChartData(userId);
    }

    //    category wise expense
    public List<PieChart> getExpensePieChartData(int userId){
       return chartRepo.getExpensePieChartData(userId);
    }
    //   line chart expense data
    public List<LineChart> lineChartExpenseData(int userId){
        return chartRepo.lineChartExpenseData(userId);
    }
    //   line chart savings data
    public List<SavingsChart> lineChartSavingsData(int userId){
        return chartRepo.lineChartSavingsData(userId);
    }
    public void stackedBarChart(){
        chartRepo.stackedBarChart();
    }
}
