package com.ujjain.crowdmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Ujjain Simhastha 2028 — Predictive Transit Command Center
 * Spring Boot entry point with CORS configuration for frontend integration.
 */
@SpringBootApplication
public class CrowdManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(CrowdManagerApplication.class, args);
    }

    /**
     * Global CORS configuration — allows the React frontend (localhost:5173)
     * to communicate with this Spring Boot backend (localhost:8080).
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5173", "http://localhost:3000", "*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }
}
