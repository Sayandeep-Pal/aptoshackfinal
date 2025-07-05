FROM ubuntu:jammy

# Install required tools
RUN apt-get update && apt-get install -y curl unzip npm bash

# Install Aptos CLI (stable)
RUN curl -fsSL https://aptos.dev/scripts/install_cli.sh | sh

# Add Aptos CLI to path
ENV PATH="/root/.local/bin:$PATH"


# Set working directory
WORKDIR /app

# Copy backend files, including the aptos project
COPY . .

# Install Node dependencies
RUN npm install

# Expose port and start server
EXPOSE 4000
CMD ["npm", "start"]