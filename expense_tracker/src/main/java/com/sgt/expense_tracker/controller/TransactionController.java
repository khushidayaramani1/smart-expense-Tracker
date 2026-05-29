package com.sgt.expense_tracker.controller;


import com.sgt.expense_tracker.Dto.TransactionDto;
import com.sgt.expense_tracker.model.Transaction;
import com.sgt.expense_tracker.repository.TransactionRepo;
import com.sgt.expense_tracker.service.TransactionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    private final Logger logger = LoggerFactory.getLogger(TransactionController.class);

    @Autowired
    TransactionService transactionService;

    @PostMapping("/add-transaction")
    public ResponseEntity<?> addTransaction(@RequestBody TransactionDto transactionDto, Authentication auth){
        String username = auth.getName();
        System.out.println("transaction details "+ transactionDto.getDateOfTransaction()+"-"+
                transactionDto.getNote());
        int ans = transactionService.addTransaction(transactionDto,username);
        if(ans == 1){
            return ResponseEntity.ok().body(Map.of("response","inserted successfully"));
        }
        return ResponseEntity.badRequest().body(Map.of("resposne","could not insert data"));
    }

    @GetMapping("/get-all-transaction")
    public List<TransactionDto> getAllTransactions(Authentication auth){
       return transactionService.getAllTransactions(auth.getName());
    }
}
