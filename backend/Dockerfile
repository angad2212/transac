# Step 1: Use an official Node.js image as the base
FROM node:18

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of your backend application code into the container
COPY . .

# Step 6: Expose the port that your backend server will run on
EXPOSE 3003

# Step 7: Start the backend server
CMD ["node", "index.js"]
