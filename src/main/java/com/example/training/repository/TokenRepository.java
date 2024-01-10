package com.example.training.repository;
import java.util.List;
import java.util.Optional;

import com.example.training.model.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TokenRepository extends JpaRepository<Token, Long> {



    Optional<Token> findByToken(String token);
}