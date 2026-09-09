# RoshnaMart — Modern Multi-Vendor E-Commerce Marketplace

A production-style multi-vendor e-commerce platform built with **Spring Boot 3.3.3**, **MySQL 8**, **Java 17**, and **React 19 + Vite**. RoshnaMart seamlessly connects Buyers, Independent Sellers, and Platform Administrators in a secure, role-governed ecosystem.

---

## Key Features & Highlights

### 1. Multi-Vendor Architecture & Strict Seller Isolation
- **Role-Based Access Control**: Strict separation between `ROLE_BUYER`, `ROLE_SELLER`, and `ROLE_ADMIN` via JWT authentication and Spring Security.
- **Strict Data Isolation**: Sellers have access *only* to their own catalog products, orders, sales metrics, and notifications. Sellers cannot see or modify items belonging to another merchant.
- **Consolidated Multi-Vendor Checkout**: Buyers can add products from multiple distinct sellers into a single cart. During checkout, a single parent order is created and seamlessly split into seller-specific line items with independent fulfillment lifecycle tracking (`PLACED` → `PROCESSING` → `SHIPPED` → `DELIVERED` → `CANCELLED`).

### 2. Dynamic Marketplace Engine
- **No Hardcoded Configurations**: Marketplace commission rates, delivery charges, free shipping thresholds, minimum order requirements, and return windows are driven dynamically via backend database settings and exposed via `GET /api/settings`.
- **Dynamic Commission Accounting**: Calculates gross sales, platform commission deduction, and seller net earnings per order item.
- **Vendor-Grouped Cart & Real Progress Meter**: Visual grouping by seller in the shopping cart with live subtotal breakdown and free shipping goal indicators.
- **Interactive Online Payment Sandbox**: Realistic modal simulation with instant card validation and UPI handling.
- **Zero Browser Native Popups**: All confirmations, deactivations, and rejections utilize custom animated `ConfirmModal` dialogs.

### 3. Real Backend & Database Integration
- **Zero Fake Mock Data**: 100% of products, reviews, categories, sellers, coupons, addresses, orders, and audit logs originate from MySQL through Spring Boot REST APIs.
- **Debounced Live Search**: Real-time product search suggestions in the navigation bar querying backend catalog indexes.
- **Audit Logging**: Comprehensive administration log recording merchant approvals, suspensions, settings updates, and category changes.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 17, Spring Boot 3.3.3, Spring Data JPA, Hibernate ORM, Spring Security, jjwt 0.12.6, Spring Validation, Lombok |
| **Database** | MySQL 8.4 Community Server, HikariCP Connection Pooling |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons, Axios, Canvas Confetti |
| **API Docs** | SpringDoc OpenAPI / Swagger UI 2.6.0 |

---

## Demo Credentials

All test accounts are pre-seeded in the database with BCrypt-hashed passwords:

| Role | Name | Email | Password | Details |
|---|---|---|---|---|
| **Admin** | Super Administrator | `admin@roshnamart.com` | `Admin@123` | Full administrative control, seller approval, settings, audit trail |
| **Seller A** | Apex Electronics Hub | `techseller@roshnamart.com` | `Seller@123` | Approved electronics vendor, 5% commission rate |
| **Seller B** | Urban Vogue Fashion | `fashionseller@roshnamart.com` | `Seller@123` | Approved apparel vendor, 5% commission rate |
| **Seller C** | Pure Organics & Naturals | `organicseller@roshnamart.com` | `Seller@123` | Merchant verification workflow testing |
| **Buyer** | John Doe | `buyer@roshnamart.com` | `Buyer@123` | Default buyer account with pre-configured addresses and order history |

---

## Available Coupons

Pre-seeded coupons for testing checkout discounts:

- `WELCOME10`: 10% discount on orders above ₹500 (Max discount ₹200)
- `ROSHNA20`: 20% discount on orders above ₹1,500 (Max discount ₹500)
- `SAVE50`: Flat ₹50 off on orders above ₹300

---

## Project Structure

```
RoshnaMart/
├── backend/
│   ├── src/main/java/com/roshnamart/
│   │   ├── config/             # SecurityConfig, DataInitializer, CorsConfig
│   │   ├── controller/         # Admin, Auth, Buyer, Seller, Settings, Product, Category
│   │   ├── dto/                # Request/Response Data Transfer Objects
│   │   ├── entity/             # JPA Entities (User, Seller, Product, Order, Cart, Coupon, etc.)
│   │   ├── repository/         # Spring Data JPA Repositories
│   │   ├── security/           # JWT Token Provider, Filters, UserDetails
│   │   └── service/            # Core business logic & isolation enforcement
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ConfirmModal, Toast, ErrorBoundary
│   │   ├── context/            # AuthContext, CartContext, ToastContext
│   │   ├── pages/
│   │   │   ├── admin/          # Admin Dashboard, Sellers, Coupons, Orders, Settings, Logs
│   │   │   ├── buyer/          # Cart, Checkout, OrderSuccess, Orders, Profile, Wishlist
│   │   │   ├── seller/         # Seller Dashboard, Products, Orders, Analytics
│   │   │   └── public/         # Home, Products, ProductDetail, Login, Register
│   │   └── services/           # Axios service clients for all backend controllers
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- **Java 17+** (JDK 17)
- **Apache Maven 3.8+**
- **Node.js 18+** & npm
- **MySQL 8.0+**

### 2. Database Configuration
Ensure MySQL is running on `localhost:3306`. The application will automatically create `roshnamart_db` if it does not exist:
```properties
# backend/src/main/resources/application.yml
url: jdbc:mysql://localhost:3306/roshnamart_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
username: root
password: ""
```

### 3. Running the Backend
```bash
cd d:/RoshnaMart/backend
mvn clean spring-boot:run
```
- Backend starts at: `http://localhost:8080`
- Swagger UI / API Documentation: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/api-docs`

### 4. Running the Frontend
```bash
cd d:/RoshnaMart/frontend
npm install
npm run dev
```
- Frontend starts at: `http://localhost:5173`

---

## Running Verification & Tests

### Backend Unit & Integration Tests
Execute the Maven Surefire test suite:
```bash
cd d:/RoshnaMart/backend
mvn test
```
All unit and integration tests validate:
- Public marketplace settings retrieval
- Role-based authentication and token generation
- Multi-vendor cart isolation and transactional checkout

### End-to-End Test Suite
Run the automated PowerShell end-to-end test suite:
```bash
powershell -ExecutionPolicy Bypass -File d:/RoshnaMart/backend/src/test/e2e_test.ps1
```
The test verifies:
1. Public settings retrieval (`GET /api/settings`)
2. Live search suggestions (`GET /api/products?search=wireless`)
3. Buyer login and address management (`/api/auth/login`, `/api/buyer/addresses`)
4. Multi-vendor cart items addition from distinct sellers (`/api/buyer/cart/items`)
5. Coupon code validation (`/api/buyer/coupons/validate?code=WELCOME10`)
6. Atomic multi-vendor order placement (`/api/buyer/checkout`)
7. Seller order isolation and status fulfillment (`/api/seller/orders`, `/api/seller/orders/items/{id}/status`)
8. Admin dashboard metrics and merchant approval workflow (`/api/admin/sellers/{id}/approve`)

---

## License
MIT License. Built for RoshnaMart Marketplace.
