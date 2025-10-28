# Multi-stage Dockerfile using official Maven + OpenJDK 21 image
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# Lightweight JRE runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy built jar from build stage
COPY --from=build /app/target/crowd-manager-1.0.0.jar app.jar

# Render assigns port dynamically via PORT env var or defaults to 8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
