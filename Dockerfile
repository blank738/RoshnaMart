# ==========================================
# RoshnaMart Root Dockerfile
# Builds the Spring Boot backend service
# Usage: docker build -t roshnamart-backend .
# For full-stack deployment, use: docker compose up --build
# ==========================================

# ------------------------------------------
# Stage 1: Build JAR with Maven & JDK 17
# ------------------------------------------
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Cache Maven dependencies layer
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy backend source code and build JAR
COPY backend/src ./src
RUN mvn clean package -DskipTests

# ------------------------------------------
# Stage 2: Lightweight JRE 17 Runtime
# ------------------------------------------
FROM eclipse-temurin:17-jre-alpine AS runner

WORKDIR /app

# Create dedicated non-root user
RUN addgroup -S spring && adduser -S spring -G spring

# Create uploads storage directory and set permissions
RUN mkdir -p /app/uploads && chown -R spring:spring /app

# Copy built JAR from builder
COPY --from=builder --chown=spring:spring /build/target/*.jar /app/app.jar

# Switch to non-root user
USER spring:spring

# Expose Spring Boot port
EXPOSE 8080

# Configure environment variables
ENV SPRING_PROFILES_ACTIVE=prod \
    ROSHNAMART_UPLOAD_DIR=/app/uploads

# Start the Spring Boot application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/app.jar"]
