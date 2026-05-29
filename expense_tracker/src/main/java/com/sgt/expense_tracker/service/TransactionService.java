package com.sgt.expense_tracker.service;

import com.sgt.expense_tracker.Dto.TransactionDto;
import com.sgt.expense_tracker.model.Transaction;
import com.sgt.expense_tracker.model.User;
import com.sgt.expense_tracker.repository.AuthRepository;
import com.sgt.expense_tracker.repository.TransactionRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class TransactionService {

    private final Logger logger = LoggerFactory.getLogger(TransactionService.class);

    @Autowired
    TransactionRepo transactionRepo;
    @Autowired
    AuthRepository authRepository;

    public int addTransaction(TransactionDto transactionDto, String username){
        return transactionRepo.addTransaction(transactionDto,username);
    }


    public List<Map<String,Object>> filterData(Map<String,Object> dataToFilter, String username){
        logger.info("username: " + username);

        User user = authRepository.findUserByUsername(username);
        if(user == null){
            return null;
        }
        int id = user.getId();

        // Safely casting objects to String
        return transactionRepo.getTransaction(
                (String) dataToFilter.get("category"),
                (String) dataToFilter.get("date"),
                (String) dataToFilter.get("type"),
                (String) dataToFilter.get("notes"),
                (String) dataToFilter.get("amount"),
                (String) dataToFilter.get("amountOrder"),
                (String) dataToFilter.get("column"),
                id
        );
    }

    public List<TransactionDto> getAllTransactions(String username){
        User u = authRepository.findUserByUsername(username);
        return transactionRepo.getAllTransactions(u.getId());
    }

}
