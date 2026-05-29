package com.sgt.expense_tracker.service;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import com.sgt.expense_tracker.repository.AuthRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class CustomUserService implements UserDetailsService {

    @Autowired
    AuthRepository authRepository;

    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        com.sgt.expense_tracker.model.User myUser = authRepository.findUserByUsername(username);
        if(myUser==null){
            throw new UsernameNotFoundException("user with this username not found");
        }
        return org.springframework.security.core.userdetails.User.builder()
                .username(myUser.getUsername())
                .password(myUser.getPassword()) // This must be a BCrypt hash in the DB
                .roles("USER")
                .build();
    }
}
