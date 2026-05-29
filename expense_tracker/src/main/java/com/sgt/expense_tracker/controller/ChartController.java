package com.sgt.expense_tracker.controller;

import com.sgt.expense_tracker.model.ChartDto;
import com.sgt.expense_tracker.service.ChartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class ChartController {
    @Autowired
    ChartService chartService;
    @GetMapping("/chart-info/{userId}")
    public ChartDto getExpensePieChartData(@PathVariable("userId") int userId){
        ChartDto chartDto = new ChartDto();
        chartDto.setPieChartExpenseList(chartService.getExpensePieChartData(userId));
        chartDto.setPieChartIncomeList(chartService.getIncomePieChartData(userId));
        chartDto.setLineChartList(chartService.lineChartExpenseData(userId));
        chartDto.setSavingsChartList(chartService.lineChartSavingsData(userId));
        return chartDto;
    }
}

//represent data on screen -> graph
//static data k sath chart banao
//api call karo start of the component
//pie chart, line chart -> state variable, har ek graph ek variable
