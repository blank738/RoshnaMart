package com.roshnamart.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.roshnamart.service.chat.ChatProvider;
import com.roshnamart.service.chat.GeminiChatProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.LinkedList;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * ChatServlet handles incoming chat requests at /api/chat.
 * Constraints enforced:
 * 1. Validates message input (not blank).
 * 2. Enforces input length cap (500 characters).
 * 3. Enforces per-session rate limit (10 messages/minute).
 * 4. In-memory per-session cache for repeated identical questions.
 * 5. Outbound API call wrapped in try/catch returning static degraded response on failure.
 */
public class ChatServlet extends HttpServlet {

    private static final Logger log = LoggerFactory.getLogger(ChatServlet.class);

    public static final int MAX_INPUT_LENGTH = 500;
    public static final int RATE_LIMIT_MAX_REQUESTS = 10;
    public static final long RATE_LIMIT_WINDOW_MS = 60_000L; // 1 minute

    public static final String SESSION_RATE_LIMIT_KEY = "CHAT_RATE_LIMIT_TIMESTAMPS";
    public static final String SESSION_CACHE_KEY = "CHAT_SESSION_CACHE";

    private final ChatProvider chatProvider;
    private final ObjectMapper objectMapper;

    public ChatServlet(ChatProvider chatProvider, ObjectMapper objectMapper) {
        this.chatProvider = chatProvider;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        // 1. Read request body
        StringBuilder stringBuilder = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                stringBuilder.append(line);
            }
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to read request body.");
            return;
        }

        String rawBody = stringBuilder.toString().trim();
        if (rawBody.isEmpty()) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Request body cannot be empty.");
            return;
        }

        String message;
        try {
            JsonNode rootNode = objectMapper.readTree(rawBody);
            JsonNode messageNode = rootNode.path("message");
            if (messageNode.isMissingNode() || messageNode.isNull()) {
                sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Field 'message' is required.");
                return;
            }
            message = messageNode.asText();
        } catch (Exception e) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid JSON format: " + e.getMessage());
            return;
        }

        // 2. Validate input message
        if (message == null || message.trim().isEmpty()) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Message cannot be empty.");
            return;
        }

        // 3. Enforce input length cap (500 chars)
        if (message.length() > MAX_INPUT_LENGTH) {
            sendError(resp, HttpServletResponse.SC_BAD_REQUEST,
                    "Message exceeds maximum allowed length of " + MAX_INPUT_LENGTH + " characters.");
            return;
        }

        HttpSession session = req.getSession(true);

        // 4. Enforce per-session rate limit (10 messages per minute)
        if (isRateLimited(session)) {
            resp.setStatus(429); // 429 Too Many Requests
            Map<String, Object> errorMap = Map.of(
                    "error", "Rate limit exceeded. Maximum 10 messages per minute allowed.",
                    "rateLimited", true,
                    "status", 429
            );
            resp.getWriter().write(objectMapper.writeValueAsString(errorMap));
            return;
        }

        // 5. In-memory per-session caching for repeated identical questions
        String normalizedKey = message.trim().toLowerCase(Locale.ROOT);
        Map<String, String> cache = getSessionCache(session);
        if (cache.containsKey(normalizedKey)) {
            String cachedReply = cache.get(normalizedKey);
            sendSuccess(resp, cachedReply, chatProvider.getProviderName(), true);
            return;
        }

        // 6. Invoke ChatProvider with try/catch fallback (degraded response instead of error page)
        String reply;
        try {
            reply = chatProvider.generateReply(message);
        } catch (Exception e) {
            log.error("Exception invoking ChatProvider {}: {}", chatProvider.getProviderName(), e.getMessage());
            reply = GeminiChatProvider.STATIC_DEGRADED_RESPONSE;
        }

        if (reply == null || reply.trim().isEmpty()) {
            reply = GeminiChatProvider.STATIC_DEGRADED_RESPONSE;
        }

        // Cache the successful/degraded response in session
        cache.put(normalizedKey, reply);

        sendSuccess(resp, reply, chatProvider.getProviderName(), false);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        Map<String, Object> info = Map.of(
                "status", "active",
                "service", "RoshnaMart AI Chatbot",
                "provider", chatProvider.getProviderName(),
                "rateLimitPerMinute", RATE_LIMIT_MAX_REQUESTS,
                "maxLength", MAX_INPUT_LENGTH
        );
        resp.getWriter().write(objectMapper.writeValueAsString(info));
    }

    private synchronized boolean isRateLimited(HttpSession session) {
        @SuppressWarnings("unchecked")
        LinkedList<Long> timestamps = (LinkedList<Long>) session.getAttribute(SESSION_RATE_LIMIT_KEY);
        if (timestamps == null) {
            timestamps = new LinkedList<>();
            session.setAttribute(SESSION_RATE_LIMIT_KEY, timestamps);
        }

        long now = System.currentTimeMillis();
        long cutoff = now - RATE_LIMIT_WINDOW_MS;

        while (!timestamps.isEmpty() && timestamps.peekFirst() < cutoff) {
            timestamps.pollFirst();
        }

        if (timestamps.size() >= RATE_LIMIT_MAX_REQUESTS) {
            return true;
        }

        timestamps.addLast(now);
        return false;
    }

    @SuppressWarnings("unchecked")
    private Map<String, String> getSessionCache(HttpSession session) {
        Map<String, String> cache = (Map<String, String>) session.getAttribute(SESSION_CACHE_KEY);
        if (cache == null) {
            cache = new ConcurrentHashMap<>();
            session.setAttribute(SESSION_CACHE_KEY, cache);
        }
        return cache;
    }

    private void sendError(HttpServletResponse resp, int statusCode, String message) throws IOException {
        resp.setStatus(statusCode);
        Map<String, Object> errorMap = Map.of(
                "error", message,
                "status", statusCode
        );
        resp.getWriter().write(objectMapper.writeValueAsString(errorMap));
    }

    private void sendSuccess(HttpServletResponse resp, String reply, String provider, boolean cached) throws IOException {
        resp.setStatus(HttpServletResponse.SC_OK);
        Map<String, Object> responseMap = Map.of(
                "reply", reply,
                "provider", provider,
                "cached", cached,
                "status", HttpServletResponse.SC_OK
        );
        resp.getWriter().write(objectMapper.writeValueAsString(responseMap));
    }
}
