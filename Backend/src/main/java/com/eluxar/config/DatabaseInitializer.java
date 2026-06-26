package com.eluxar.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init() {
        try {
            log.info("Checking for legacy category check constraints...");
            // PostgreSQL does not have 'DROP CONSTRAINT IF EXISTS' in very old versions, 
            // but since we use PostgreSQL 15+, this is the cleanest way.
            jdbcTemplate.execute("ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_categoria_check");
            log.info("Successfully dropped legacy category check constraint if it existed.");
        } catch (Exception e) {
            log.error("Error dropping category constraint: {}", e.getMessage());
        }
    }
}
