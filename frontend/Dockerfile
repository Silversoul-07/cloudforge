# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy only package.json and pnpm-lock.yaml to leverage Docker cache for dependencies
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Set environment variables
ARG FRONTEND_URL
ARG BACKEND_URL
ARG MEDIA_URL
ARG NODE_ENV

ENV NEXT_PUBLIC_FRONTEND=$FRONTEND_URL
ENV NEXT_PUBLIC_BACKEND=$BACKEND_URL
ENV NEXT_PUBLIC_MEDIA=$MEDIA_URL
ENV NODE_ENV=$NODE_ENV

# Command to start the development server
CMD ["pnpm", "dev"]
