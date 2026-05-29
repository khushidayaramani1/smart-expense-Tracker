package com.sgt.expense_tracker.repository;

import com.sgt.expense_tracker.Dto.CategoryDto;
import com.sgt.expense_tracker.model.Category;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class CategoryRepo {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final Logger logger = LoggerFactory.getLogger(CategoryRepo.class);

//    public List<Map<String,Object>> findCategoryByUserId(int userId) {
//        String sql = "SELECT * FROM categories WHERE userId = ? AND active_yn = 1";
//        Category c = new Category();
//        c = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
//            Category cat = new Category();
//            cat.setCategoryId(rs.getInt("categoryId"));
//            cat.setCategoryName(rs.getString("categoryName"));
//            cat.setType(rs.getString("type"));
//            cat.setIconUrl(rs.getString("iconUrl"));
//            return cat;
//        }, userId);
//        retrun c;
//    }

    public Integer getUserIdByUsername(String username){
        String sql = "select userId from user where username =?";
        return jdbcTemplate.queryForObject(sql,Integer.class,username);
    }
    public int addCategory(CategoryDto cDto, String username){
        String sql = "INSERT INTO category (categoryName, categoryDescription, iconUrl, type, userId) VALUES (?, ?, ?, ?,?);";
        logger.info("category type ---> "+cDto.getCategoryType());
        int userId = getUserIdByUsername(username);
        return jdbcTemplate.update(sql,
                 cDto.getCategoryName(),
                cDto.getCategoryDescription(),
                cDto.getIconUrl(),
                cDto.getCategoryType()
                ,userId);
    }

    public List<String> getCategoryNames(String username){
        String sql = "SELECT DISTINCT c.categoryName \n" +
                "FROM category c\n" +
                "JOIN user u ON c.userId = u.userId \n" +
                "WHERE u.username = ?AND c.categoryName IS NOT NULL \n" +
                "  AND c.categoryName <> '';";
        return jdbcTemplate.queryForList(sql,String.class,username);
    }

    public List<Category> getCategoriesByUserId(int userId) {
        String sql = "SELECT * FROM category WHERE userId = ? AND active_yn = 1";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Category category = new Category();
            category.setCategoryId(rs.getInt("categoryId"));
            category.setCategoryName(rs.getString("categoryName"));
            category.setCategoryDescription(rs.getString("categoryDescription"));
            category.setIconUrl(rs.getString("iconUrl"));
            category.setType(rs.getString("type"));
            category.setUserId(rs.getInt("userId"));
            // Agar created_at/updated_at fields model mein hain toh wo bhi set kar sakte ho
            return category;
        }, userId);
    }

    public String getCategoryType(String category){
        String sql = "select type from category where categoryName = ?;";
        return jdbcTemplate.queryForObject(sql,String.class,category);
    }

    public CategoryDto findCategoryById(int id) {
        String sql = "SELECT * FROM category WHERE categoryId = ?";
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                CategoryDto categoryDto = new CategoryDto();
                categoryDto.setCategoryId(rs.getInt("categoryId"));
                categoryDto.setCategoryName(rs.getString("categoryName"));
                categoryDto.setCategoryDescription(rs.getString("categoryDescription"));
                categoryDto.setCategoryType(rs.getString("type"));
                categoryDto.setIconUrl(rs.getString("iconUrl"));
                categoryDto.setTotalBudget(rs.getInt("totalBudget"));
                categoryDto.setSpent(rs.getInt("spent"));
                categoryDto.setRemaining(rs.getInt("remaining"));
                return categoryDto;
            }, id);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public void updateCategory(CategoryDto cd ){
        String sql = "update category set categoryName=?," +
                "categoryDescription=?," +
                "iconUrl=?,type=?," +
                "totalBudget=?,spent=?," +
                "remaining=? where categoryId = ?";

        jdbcTemplate.update(sql,cd.getCategoryName(),
                cd.getCategoryDescription(),
                cd.getIconUrl(),cd.getCategoryType(),
                cd.getTotalBudget(),cd.getSpent(),
                cd.getRemaining(),cd.getCategoryId());
    }

    public int updateAmount(int categoryId, int amount) {
        CategoryDto c =  findCategoryById(categoryId);
        if (c == null) {
            return 0;
        }
        String categoryType = c.getCategoryType();
        String sql = null;
        if ("expense".equalsIgnoreCase(categoryType)) {
            sql = "UPDATE category SET spent = spent + ? WHERE categoryId = ?;";
        } else if ("income".equalsIgnoreCase(categoryType)) {
            sql = "UPDATE category SET totalBudget = totalBudget + ? WHERE categoryId = ?;";
        }
        if (sql == null) {
            return 0;
        }
        return jdbcTemplate.update(sql, amount, categoryId);
    }
    public List<Map<String,Object>> getBudgetSplit(int userId){
        String sql = "select sum(totalBudget) as SALARY_RECEIVED, sum(spent) AS SPENT , sum(remaining) as REMAINING from category where userId =?;";
        return jdbcTemplate.queryForList(sql,userId);
    }

    public Integer findCategoryIdByCategoryName(String categoryName){
        Integer catId = jdbcTemplate.queryForObject("select categoryId from category where LOWER(categoryName)=?",
                Integer.class,categoryName);
        return catId;
    }
    public List<Category> findAllByUserId(int userId) {
        String sql = "SELECT * FROM category WHERE userId = ? AND active_yn = 1";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Category c = new Category();
            c.setCategoryId(rs.getInt("categoryId"));
            c.setCategoryName(rs.getString("categoryName"));
            c.setType(rs.getString("type"));
            c.setTotalBudget(rs.getInt("totalBudget"));
            c.setSpent(rs.getInt("spent"));
            c.setRemaining(rs.getInt("remaining"));
            return c;
        }, userId);
    }
}