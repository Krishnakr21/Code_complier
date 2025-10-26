FROM openjdk:17-alpine

# Create app directory
WORKDIR /workspace

# Install security updates
RUN apk update && apk upgrade

# Create non-root user
RUN addgroup -g 1001 -S java
RUN adduser -S java -u 1001

# Set JVM options for memory limit
ENV JAVA_OPTS="-Xmx128m -Xms32m"

# Switch to non-root user
USER java

# Default command
CMD ["java"]
