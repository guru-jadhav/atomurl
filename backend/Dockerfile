# --- Stage 1: Build stage ---
# Uses a Maven image with JDK 25 to compile the project
FROM maven:3.9-eclipse-temurin-25 AS builder

WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml ./
COPY src/ ./src/

# Package the application (skipping tests for a faster build)
RUN mvn clean package -DskipTests

# --- Stage 2: Runtime stage ---
# Uses a lightweight JRE 25 image for the running container
FROM eclipse-temurin:25-jre

WORKDIR /app

# Copy the built jar file from the builder stage
COPY --from=builder /app/target/com.gurujadhav.atomurl-0.0.1-SNAPSHOT.jar app.jar

# Expose Spring Boot's default port
EXPOSE 8080

# Start the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
