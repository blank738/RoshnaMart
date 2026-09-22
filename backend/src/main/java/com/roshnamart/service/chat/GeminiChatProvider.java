package com.roshnamart.service.chat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * GeminiChatProvider integrates with the Google Gemini REST API.
 * Uses a fixed server-side prompt template to restrict domain scope to RoshnaMart product/listing queries.
 * API key is stored server-side only and never exposed to the client.
 */
@Component
public class GeminiChatProvider implements ChatProvider {

    private static final Logger log = LoggerFactory.getLogger(GeminiChatProvider.class);

    public static final String STATIC_DEGRADED_RESPONSE =
            "I am currently experiencing higher than usual traffic, but I'm here to help with your RoshnaMart shopping questions! Please feel free to browse our product catalog or contact customer support at support@roshnamart.com.";

    private static final String SYSTEM_PROMPT_TEMPLATE = """
            You are the RoshnaMart AI Shopping Assistant for the RoshnaMart Multi-Vendor E-Commerce Marketplace.
            You help buyers and sellers with product discovery, categories, orders, shipping rates, returns, seller onboarding, and platform coupons (WELCOME10, ROSHNA20, SAVE50).
            
            STRICT DOMAIN CONSTRAINT:
            Your scope is strictly restricted to RoshnaMart e-commerce, product catalog, orders, shipping, returns, coupons, payment options, and merchant queries.
            If the user asks about anything outside RoshnaMart shopping or e-commerce (such as general programming, unrelated math, world politics, creative writing, or trivia), you MUST politely decline and clarify that you are only authorized to assist with RoshnaMart shopping questions.
            
            Keep your answers concise, accurate, and professional.
            
            User message: %s
            """;

    private final String apiKey;
    private final String model;
    private final int timeoutMs;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiChatProvider(
            @Value("${ai.chatbot.gemini.api-key:}") String apiKey,
            @Value("${ai.chatbot.gemini.model:gemini-1.5-flash}") String model,
            @Value("${ai.chatbot.gemini.timeout-ms:5000}") int timeoutMs,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.model = model;
        this.timeoutMs = timeoutMs;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(timeoutMs))
                .build();
    }

    @Override
    public String getProviderName() {
        return "gemini";
    }

    @Override
    public String generateReply(String userMessage) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("Gemini API key is not configured; returning degraded fallback response.");
            return STATIC_DEGRADED_RESPONSE;
        }

        try {
            String fullPrompt = String.format(SYSTEM_PROMPT_TEMPLATE, userMessage);
            String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", model, apiKey);

            Map<String, Object> textPart = Collections.singletonMap("text", fullPrompt);
            Map<String, Object> contentMap = Collections.singletonMap("parts", List.of(textPart));
            Map<String, Object> requestPayload = Collections.singletonMap("contents", List.of(contentMap));

            String requestBody = objectMapper.writeValueAsString(requestPayload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofMillis(timeoutMs))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.warn("Gemini API returned status code {}: {}", response.statusCode(), response.body());
                return STATIC_DEGRADED_RESPONSE;
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    String reply = parts.get(0).path("text").asText();
                    if (reply != null && !reply.trim().isEmpty()) {
                        return reply.trim();
                    }
                }
            }

            return STATIC_DEGRADED_RESPONSE;
        } catch (Exception e) {
            log.error("Exception occurred while calling Gemini API: {}", e.getMessage());
            return STATIC_DEGRADED_RESPONSE;
        }
    }
}
