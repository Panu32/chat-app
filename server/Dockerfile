# Use an official Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your backend source code
COPY . .

# Expose the port your backend server runs on (e.g., 3001)
EXPOSE 3001

# The command to start your server
CMD ["npm", "start"]