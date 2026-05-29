package com.sgt.expense_tracker.controller;


import com.sgt.expense_tracker.Dto.CategoryDto;
import com.sgt.expense_tracker.model.Category;
import com.sgt.expense_tracker.model.User;
import com.sgt.expense_tracker.repository.AuthRepository;
import com.sgt.expense_tracker.service.AuthService;
import com.sgt.expense_tracker.service.CategoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {

    private final Logger logger = LoggerFactory.getLogger(CategoryController.class);

    @Autowired
    CategoryService categoryService;
    @Autowired
    AuthService authService;


//    @GetMapping("/categories/{userId}")
//    public ResponseEntity<?> getCategories(@PathVariable int userId) {
//        List<Map<String,Object>> categories = categoryService.findCategoryByUserId(userId);
//        return ResponseEntity.ok(categories);
//    }

    @PostMapping("/add-category")
    public ResponseEntity<?> addCategory(@RequestBody CategoryDto categoryDto,
                                         Authentication auth){
        logger.info("{category map that came from frontend}"+categoryDto);
        String username = auth.getName();
            int ans =categoryService.addCategory(categoryDto,username);
            if(ans!=0){
                return ResponseEntity.ok().body(Map.of("response","category added successfully"));
            }
         return ResponseEntity.badRequest().body(Map.of("response","could not add category try again"));
    }

    @GetMapping("/category-names")
    public List<String> getCategoryNames(Authentication auth){
//        names of category entered by particular user
        String username = auth.getName();
        return categoryService.getCategoryNames(username);
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getCategoriesByUserId(Authentication auth){
        String username = auth.getName();
        User user = authService.findUserByUsername(username);
        int userId = user.getId();
        List<Category> categories = categoryService.getCategoriesByUserId(userId);
        if(categories!=null){
            return ResponseEntity.ok().body(Map.of("response",categories));
        }
        return ResponseEntity.badRequest().body(Map.of("response","no categories till now"));
    }

    @PutMapping("/update-category")
    public ResponseEntity<?> updateCategory(@RequestBody CategoryDto categoryDto,
                                            Authentication auth){
        logger.info("loggin for the money related info"+
                categoryDto.getRemaining()+"-"+
                categoryDto.getTotalBudget()+"-"+
                categoryDto.getSpent());
        int id = categoryDto.getCategoryId();
        String username = auth.getName();
        if(username==null){
            return ResponseEntity.badRequest().body(Map.of("response","please login"));
        }

        CategoryDto cd = categoryService.findCategoryById(id);
        if(cd==null){
            return ResponseEntity.badRequest().body(Map.of("response","Category not found"));
        }
        categoryService.updateCategory(categoryDto);
        return ResponseEntity.ok().body(Map.of("response","Updated Category"));
    }

    @GetMapping("/budget-split")
    public ResponseEntity<?> getBudgetSplit(Authentication auth){
        List<Map<String,Object>> response = categoryService.getBudgetSplit(auth.getName());
        if(response!=null){
            return ResponseEntity.ok().body(Map.of("response",response));
        }
        return ResponseEntity.badRequest().body(Map.of("response","cannot fetch"));
    }
}
//take price/budget as input from categories