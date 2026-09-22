# RoshnaMart Sprint Retrospective (RETRO.md)

Format per sprint: **What worked** | **What didn't** | **One change for next sprint**

---

### Sprint 1 (Foundations: Auth, RBAC & Multi-Vendor Models)
- **What worked**: Strict role-based isolation (Buyer, Seller, Admin) and entity relationships mapped cleanly in JPA.
- **What didn't**: Initial database migrations had minor foreign key ordering hiccups with seller addresses.
- **One change for next sprint**: Implement atomic transactional integration tests for multi-entity relationship initialization.

---

### Sprint 2 (Marketplace Core: Multi-Vendor Split Checkout, Order Lifecycle & Admin Settings)
- **What worked**: Consolidated multi-vendor cart splitting into independent seller fulfillment line items worked flawlessly.
- **What didn't**: Dynamic free shipping progress calculations caused slight UI re-render jitter before debouncing was added.
- **One change for next sprint**: Decouple external service interfaces early using dedicated provider interfaces.

---

### Sprint 3 (AI Chatbot Backend Proxy & Floating Chat Widget)
- **What worked**: ChatProvider interface decoupled Mock and Gemini LLMs cleanly with instant canned FAQ domain responses and per-session caching.
- **What didn't**: Outbound rate limits needed synchronized session locking to prevent race conditions during burst traffic.
- **One change for next sprint**: Add streaming responses via SSE (Server-Sent Events) for longer LLM generation flows.
