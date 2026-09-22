package com.roshnamart.servlet;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.roshnamart.service.chat.ChatProvider;
import com.roshnamart.service.chat.GeminiChatProvider;
import com.roshnamart.service.chat.MockChatProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

public class ChatServletTest {

    private ChatServlet chatServlet;
    private MockChatProvider mockChatProvider;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockChatProvider = new MockChatProvider();
        objectMapper = new ObjectMapper();
        chatServlet = new ChatServlet(mockChatProvider, objectMapper);
    }

    @Test
    @DisplayName("Validation: Empty request body returns 400 Bad Request")
    void testEmptyRequestBody() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.setContent("".getBytes(StandardCharsets.UTF_8));

        chatServlet.doPost(request, response);

        assertEquals(400, response.getStatus());
        JsonNode json = objectMapper.readTree(response.getContentAsString());
        assertTrue(json.has("error"));
    }

    @Test
    @DisplayName("Validation: Missing message field returns 400 Bad Request")
    void testMissingMessageField() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.setContent("{\"other\": \"test\"}".getBytes(StandardCharsets.UTF_8));

        chatServlet.doPost(request, response);

        assertEquals(400, response.getStatus());
        JsonNode json = objectMapper.readTree(response.getContentAsString());
        assertEquals("Field 'message' is required.", json.get("error").asText());
    }

    @Test
    @DisplayName("Validation: Blank message returns 400 Bad Request")
    void testBlankMessage() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.setContent("{\"message\": \"   \"}".getBytes(StandardCharsets.UTF_8));

        chatServlet.doPost(request, response);

        assertEquals(400, response.getStatus());
        JsonNode json = objectMapper.readTree(response.getContentAsString());
        assertEquals("Message cannot be empty.", json.get("error").asText());
    }

    @Test
    @DisplayName("Validation: Input exceeding 500 characters returns 400 Bad Request")
    void testInputLengthCap() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        String longMessage = "a".repeat(501);
        request.setContent(objectMapper.writeValueAsBytes(new MessageDto(longMessage)));

        chatServlet.doPost(request, response);

        assertEquals(400, response.getStatus());
        JsonNode json = objectMapper.readTree(response.getContentAsString());
        assertTrue(json.get("error").asText().contains("maximum allowed length"));
    }

    @Test
    @DisplayName("Chat Flow: Valid domain question returns 200 OK with canned FAQ answer")
    void testValidQuestionSuccess() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockHttpSession session = new MockHttpSession();
        request.setSession(session);
        request.setContent(objectMapper.writeValueAsBytes(new MessageDto("What coupons are available?")));

        chatServlet.doPost(request, response);

        assertEquals(200, response.getStatus());
        JsonNode json = objectMapper.readTree(response.getContentAsString());
        assertTrue(json.has("reply"));
        assertTrue(json.get("reply").asText().contains("WELCOME10"));
        assertEquals("mock", json.get("provider").asText());
        assertFalse(json.get("cached").asBoolean());
    }

    @Test
    @DisplayName("In-Memory Caching: Repeated identical question within session returns cached response")
    void testSessionCaching() throws Exception {
        MockHttpSession session = new MockHttpSession();

        // 1st call
        MockHttpServletRequest request1 = new MockHttpServletRequest();
        MockHttpServletResponse response1 = new MockHttpServletResponse();
        request1.setSession(session);
        request1.setContent(objectMapper.writeValueAsBytes(new MessageDto("How do I return an item?")));
        chatServlet.doPost(request1, response1);

        assertEquals(200, response1.getStatus());
        JsonNode json1 = objectMapper.readTree(response1.getContentAsString());
        assertFalse(json1.get("cached").asBoolean());

        // 2nd call with identical question
        MockHttpServletRequest request2 = new MockHttpServletRequest();
        MockHttpServletResponse response2 = new MockHttpServletResponse();
        request2.setSession(session);
        request2.setContent(objectMapper.writeValueAsBytes(new MessageDto("How do I return an item?")));
        chatServlet.doPost(request2, response2);

        assertEquals(200, response2.getStatus());
        JsonNode json2 = objectMapper.readTree(response2.getContentAsString());
        assertTrue(json2.get("cached").asBoolean());
        assertEquals(json1.get("reply").asText(), json2.get("reply").asText());
    }

    @Test
    @DisplayName("Rate Limiting: Enforces 10 messages/minute per session, 11th request returns 429")
    void testRateLimiting() throws Exception {
        MockHttpSession session = new MockHttpSession();

        for (int i = 1; i <= 10; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest();
            MockHttpServletResponse resp = new MockHttpServletResponse();
            req.setSession(session);
            req.setContent(objectMapper.writeValueAsBytes(new MessageDto("Question number " + i)));
            chatServlet.doPost(req, resp);
            assertEquals(200, resp.getStatus(), "Request " + i + " should succeed");
        }

        // 11th request in the same minute
        MockHttpServletRequest req11 = new MockHttpServletRequest();
        MockHttpServletResponse resp11 = new MockHttpServletResponse();
        req11.setSession(session);
        req11.setContent(objectMapper.writeValueAsBytes(new MessageDto("Question number 11")));
        chatServlet.doPost(req11, resp11);

        assertEquals(429, resp11.getStatus(), "11th request should be rate limited with HTTP 429");
        JsonNode json = objectMapper.readTree(resp11.getContentAsString());
        assertTrue(json.has("rateLimited"));
        assertTrue(json.get("rateLimited").asBoolean());
    }

    @Test
    @DisplayName("Fault Tolerance: Provider exception returns static degraded response (HTTP 200)")
    void testDegradedFallbackOnException() throws Exception {
        ChatProvider failingProvider = new ChatProvider() {
            @Override
            public String generateReply(String userMessage) {
                throw new RuntimeException("Simulated network timeout/failure");
            }

            @Override
            public String getProviderName() {
                return "failing-provider";
            }
        };

        ChatServlet servletWithFailingProvider = new ChatServlet(failingProvider, objectMapper);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        request.setContent(objectMapper.writeValueAsBytes(new MessageDto("What is shipping charge?")));

        servletWithFailingProvider.doPost(request, response);

        assertEquals(200, response.getStatus(), "Degraded response must return 200 without error page");
        JsonNode json = objectMapper.readTree(response.getContentAsString());
        assertEquals(GeminiChatProvider.STATIC_DEGRADED_RESPONSE, json.get("reply").asText());
    }

    @Test
    @DisplayName("Scope Restriction: Out of domain queries are politely declined")
    void testScopeRestriction() throws Exception {
        String reply = mockChatProvider.generateReply("Write python code to reverse a binary tree");
        assertTrue(reply.contains("I can only answer questions related to RoshnaMart")
                || reply.contains("shopping assistant"));
    }

    private static class MessageDto {
        private String message;

        public MessageDto(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
