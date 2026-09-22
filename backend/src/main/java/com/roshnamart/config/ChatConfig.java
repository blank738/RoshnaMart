package com.roshnamart.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roshnamart.service.chat.ChatProvider;
import com.roshnamart.service.chat.GeminiChatProvider;
import com.roshnamart.service.chat.MockChatProvider;
import com.roshnamart.servlet.ChatServlet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class ChatConfig {

    private static final Logger log = LoggerFactory.getLogger(ChatConfig.class);

    @Bean
    @Primary
    public ChatProvider activeChatProvider(
            @Value("${ai.chatbot.provider:mock}") String providerType,
            MockChatProvider mockChatProvider,
            GeminiChatProvider geminiChatProvider) {
        if ("gemini".equalsIgnoreCase(providerType)) {
            log.info("Active AI Chatbot Provider: GEMINI");
            return geminiChatProvider;
        }
        log.info("Active AI Chatbot Provider: MOCK (canned domain FAQ responses)");
        return mockChatProvider;
    }

    @Bean
    public ServletRegistrationBean<ChatServlet> chatServletRegistration(
            ChatProvider chatProvider,
            ObjectMapper objectMapper) {
        ChatServlet servlet = new ChatServlet(chatProvider, objectMapper);
        ServletRegistrationBean<ChatServlet> registrationBean =
                new ServletRegistrationBean<>(servlet, "/api/chat", "/api/chat/*");
        registrationBean.setName("ChatServlet");
        registrationBean.setLoadOnStartup(1);
        return registrationBean;
    }
}
