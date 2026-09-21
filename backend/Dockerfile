# ==========================================
# RoshnaMart Backend Dockerfile
# Multi-stage build for Spring Boot (Java 17)
# ==========================================

# ------------------------------------------
# Stage 1: Build JAR with Maven & JDK 17
# ------------------------------------------
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Cache Maven dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build application JAR
COPY src ./src
RUN mvn clean package -DskipTests

# ------------------------------------------
# Stage 2: Lightweight JRE 17 Runtime
# ------------------------------------------
FROM eclipse-temurin:17-jre-alpine AS runner

WORKDIR /app

# Create a dedicated non-root system user and group for security
RUN addgroup -S spring && adduser -S spring -G spring

# Create uploads storage directory and set permissions
RUN mkdir -p /app/uploads && chown -R spring:spring /app

# Copy the built JAR from builder stage
COPY --from=builder --chown=spring:spring /build/target/*.jar /app/app.jar

# Switch to non-root user
USER spring:spring

# Expose Spring Boot default port
EXPOSE 8080

# Configure default container environment variables
ENV SPRING_PROFILES_ACTIVE=prod \
    ROSHNAMART_UPLOAD_DIR=/app/uploads

# Execute Spring Boot application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/app.jar"]
