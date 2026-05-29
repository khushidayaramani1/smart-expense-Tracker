package com.sgt.expense_tracker.service;



import com.sgt.expense_tracker.Dto.CategoryDto;
import com.sgt.expense_tracker.model.Category;
import com.sgt.expense_tracker.model.User;
import com.sgt.expense_tracker.repository.AuthRepository;
import com.sgt.expense_tracker.repository.CategoryRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CategoryService {

    @Autowired
    CategoryRepo categoryRepo;

    @Autowired
    AuthRepository authRepository;

    private final Logger logger = LoggerFactory.getLogger(CategoryRepo.class);
    public int addCategory(CategoryDto categoryDto, String username){
        return categoryRepo.addCategory(categoryDto,username);
    }
    public List<String> getCategoryNames(String username){
        return categoryRepo.getCategoryNames(username);
    }
    public List<Category> getCategoriesByUserId(int userId){
        return categoryRepo.getCategoriesByUserId(userId);
    }

    public CategoryDto findCategoryById(int id){
        return categoryRepo.findCategoryById(id);
    }
    public void updateCategory(CategoryDto cd ){
        logger.info("money check from service"+cd.getSpent()+"-"+cd.getTotalBudget()+"-"+cd.getRemaining());
        categoryRepo.updateCategory(cd);
    }

    public List<Map<String,Object>> getBudgetSplit(String username){
        User u = authRepository.findUserByUsername(username);
        return categoryRepo.getBudgetSplit(u.getId());
    }
}
