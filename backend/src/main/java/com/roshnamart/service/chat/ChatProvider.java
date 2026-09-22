package com.roshnamart.service.chat;

/**
 * ChatProvider interface defining the contract for AI/LLM providers (Section 17).
 * Decouples the ChatServlet from specific LLM implementations.
 */
public interface ChatProvider {

    /**
     * Generates a reply to the user's message.
     *
     * @param userMessage the validated message from the user
     * @return the generated reply string
     */
    String generateReply(String userMessage);

    /**
     * Gets the identifier name of this provider (e.g. "mock", "gemini").
     *
     * @return provider name
     */
    String getProviderName();
}
