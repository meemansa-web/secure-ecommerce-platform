package com.ecommerce.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping
    public Map<String, Object> testApi() {

        return Map.of(
                "status", "SUCCESS",
                "message", "Secure E-Commerce API is running"
        );
    }
}