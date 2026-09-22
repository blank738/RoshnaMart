# Contributing to RoshnaMart

Thank you for your interest in contributing to RoshnaMart! This guide contains the exact steps from cloning the repository to running a complete local development instance.

---

## 1. Prerequisites

Ensure you have the following installed on your local machine:
- **Java 17 or higher** (JDK 17)
- **Apache Maven 3.8+** (or use the included `./mvnw` wrapper)
- **Node.js 18+** and **npm 9+**
- **MySQL 8.0+** running locally on port 3306 (or Docker)
- **Git**

---

## 2. Git Clone & Workspace Setup

Clone the repository to your local directory:
```bash
git clone https://github.com/your-username/RoshnaMart.git
cd RoshnaMart
```

---

## 3. Environment Configuration

### Confirmation of `.env.example` & `.env`
> [!IMPORTANT]
> - `.env.example` is committed to version control as a reference template.
> - `.env` and `.env.*.local` are strictly **gitignored** in both root and `frontend/` directories to prevent credential leakage.

Copy the template to create your local `.env`:
```bash
cp .env.example .env
```

Review or adjust `.env` parameters if needed:
```properties
# Database
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/roshnamart_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=

# JWT
ROSHNAMART_JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
ROSHNAMART_JWT_EXPIRATION_MS=86400000

# AI Chatbot Configuration
AI_CHATBOT_PROVIDER=mock
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TIMEOUT_MS=5000

# Server
PORT=8080
```

---

## 4. Running the Local Instance

### Step 1: Start MySQL Database
Ensure MySQL is running on port `3306`. The application automatically creates `roshnamart_db` and seeds initial demo data upon startup.

### Step 2: Start the Backend (Spring Boot)
Open a terminal in the `backend` directory:
```bash
cd backend
mvn clean spring-boot:run
```
- The backend server starts at: `http://localhost:8080`
- Swagger UI API documentation: `http://localhost:8080/swagger-ui.html`
- OpenAPI Specification: `http://localhost:8080/api-docs`
- AI Chatbot endpoint: `POST http://localhost:8080/api/chat`

### Step 3: Start the Frontend (React + Vite)
Open a second terminal in the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
- The frontend dev server starts at: `http://localhost:5173`
- The Vite proxy automatically routes `/api/*` requests to `http://localhost:8080`.

---

## 5. Alternative: Running via Docker Compose

To launch the complete stack (MySQL + Backend + Frontend via Nginx) with a single command:
```bash
docker compose up --build -d
```
- Storefront (Web UI + Floating Chat Widget): `http://localhost`
- Backend API & Swagger: `http://localhost:8080/swagger-ui.html`
- Stop services: `docker compose down`

---

## 6. Running Tests & Verifications

### Backend Test Suite
```bash
cd backend
mvn test
```
Validates settings, JWT authentication, multi-vendor cart isolation, order status synchronization, and `ChatServlet` rate limiting/caching.

### Frontend Production Build & Linting
```bash
cd frontend
npm run lint
npm run build
```

---

## 7. Development Guidelines

- **Chatbot Provider**: Use `MockChatProvider` for offline development. To test live Gemini LLM queries, set `AI_CHATBOT_PROVIDER=gemini` and provide `GEMINI_API_KEY` in `.env`.
- **API Keys**: Never commit API keys or secrets. Always use environment variables or properties files.
- **Pull Requests**: Ensure all backend unit tests pass (`mvn test`) and the frontend builds cleanly (`npm run build`) before opening a PR.
