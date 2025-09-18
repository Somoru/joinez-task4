FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV PORT=5000

# Expose the port
EXPOSE 5000

# Wait for database to be ready before starting server
CMD ["sh", "-c", "npm install -g nodemon && nodemon src/index.js"]