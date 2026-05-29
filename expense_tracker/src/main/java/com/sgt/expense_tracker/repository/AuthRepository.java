package com.sgt.expense_tracker.repository;

import com.sgt.expense_tracker.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

//import static com.sgt.expense_tracker.controller.AuthController.log;

@Repository
public class AuthRepository {

    private static final Logger log = LoggerFactory.getLogger(AuthRepository.class);

    @Autowired
    JdbcTemplate jdbcTemplate;

    public User findUserByEmail(String email){
        String sql = "select * from user where email = ?;";
        try {
            return jdbcTemplate.queryForObject(sql,(rs,rowNum)->{
                User user = new User();
                user.setId(rs.getInt("userId"));
                user.setEmail(rs.getString("email"));
                user.setName(rs.getString("name"));
                user.setUsername(rs.getString("username"));
                user.setPassword(rs.getString("userPassword"));
                return user;
            },email);
        }catch(EmptyResultDataAccessException e){
            return null;
        }
    }

    public User findUserByUsername(String username){
        String sql = "select * from user where username = ?;";
        try {
            return jdbcTemplate.queryForObject(sql,(rs,rowNum)->{
                User user = new User();
                user.setId(rs.getInt("userId"));
                user.setEmail(rs.getString("email"));
                user.setName(rs.getString("name"));
                user.setUsername(rs.getString("username"));
                user.setPassword(rs.getString("userPassword"));
                return user;
            },username);
        }catch(EmptyResultDataAccessException e){
            return null;
        }
    }

    public  Map<String,Object> checkEmailExists(String email){
        String sql = "select * from user where email = ?;";
        try{
            log.info("here row is inserted successfully");
            return jdbcTemplate.queryForMap(sql,email);
        }catch(EmptyResultDataAccessException e){
            e.getMessage();
        }
        return null;
    }

    public  Map<String,Object> checkUsernameExists(String username){
        String sql = "select * from user where username = ?;";
        try{
            log.info("here row is inserted successfully");
            return jdbcTemplate.queryForMap(sql,username);
        }catch(EmptyResultDataAccessException e){
            e.getMessage();
        }
        return null;
    }


    public void saveUser(User user){
        String sql = "insert into user(username,name,userPassword,email,phone) values(?,?,?,?,?);";
        try{
            jdbcTemplate.update(sql,user.getUsername(),user.getName(),user.getPassword(),user.getEmail(),user.getPhone());
        }catch(Exception e){
            throw new RuntimeException("Some problem in inserting values " + e.getMessage());
        }
    }

    public User findUserByPhoneNumber(String phoneNumber) {
        String sql = "SELECT * FROM user WHERE phone = ?";
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                User user = new User();
                user.setId(rs.getInt("userId")); // Database column name check karein
                user.setPhone(rs.getString("phone"));
                user.setEmail(rs.getString("email"));
                user.setUsername(rs.getString("username"));
                return user;
            }, phoneNumber);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public User findUserByUserId(int userId){
        String sql = "select * from user where userId=?;";
        return jdbcTemplate.queryForObject(sql,(rs,rowNum)->{
            User u = new User();
            User user = new User();
            user.setId(rs.getInt("userId")); // Database column name check karein
            user.setPhone(rs.getString("phone"));
            user.setEmail(rs.getString("email"));
            user.setUsername(rs.getString("username"));
            return user;
        },userId);
    }

    public int updatePassword(String password, int id){
        String sql = "update user set userPassword = ? where userId =?;";
        return jdbcTemplate.update(sql,password,id);
    }

    public List<String> getAllEmail(){
        String sql = "select email from user;";
        return jdbcTemplate.queryForList(sql,String.class);
    }
    public List<String> findAllUsernames() {
        String sql = "SELECT username FROM users";
        return jdbcTemplate.queryForList(sql, String.class);
    }
}
