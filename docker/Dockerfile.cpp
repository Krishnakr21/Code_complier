FROM gcc:alpine

# Create app directory
WORKDIR /workspace

# Install security updates
RUN apk update && apk upgrade

# Create non-root user
RUN addgroup -g 1001 -S cpp
RUN adduser -S cpp -u 1001

# Switch to non-root user
USER cpp

# Default command
CMD ["gcc"]
