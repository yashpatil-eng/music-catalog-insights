package com.ledgerscfo.musiccatalog.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class AnthropicClientConfig {

    @Bean
    public WebClient anthropicWebClient() {
        return WebClient.builder()
                .baseUrl("https://api.anthropic.com/v1")
                .defaultHeader("anthropic-version", "2023-06-01")
                .build();
    }
}
