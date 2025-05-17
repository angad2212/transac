const express = require("express");
const rootRouter = require("./routes/index.js")
const cors = require("cors");
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// app.use(cors());
//It allows your server to accept requests from different origins (other domains).
//since our frontend runs on a seperate server

app.use(cors(
  {origin: '*'}
));

app.use(express.json());

const connectDB = async () => {
  try {
      const conn = await mongoose.connect(process.env.MONGO_URL);
      console.log('Connected to MongoDB database');
  } catch (error) {
      console.log(`Error: ${error.message}`);
      process.exit(1);
  }
};

//calling the function to connect to database
connectDB();

app.use("/api/v1", rootRouter) //This line tells your Express application 
//to use the rootRouter for any requests that start with /api/v1.

app.listen(PORT, ()=>{
    console.log(`server running on port: ${PORT}`)
});