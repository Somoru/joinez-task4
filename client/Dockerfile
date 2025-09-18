FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Create a simple index.html file if it doesn't exist
RUN mkdir -p public
RUN touch public/index.html

# Set environment variables
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Command to run the app in development mode
CMD ["npm", "start"]