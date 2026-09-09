package com.roshnamart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class RoshnamartApplication {

    public static void main(String[] args) {
        SpringApplication.run(RoshnamartApplication.class, args);
    }
}
