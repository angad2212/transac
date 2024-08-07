const express = require("express");
const rootRouter = require("./routes/index.js")
const cors = require("cors");
//It allows your server to accept requests from different origins (other domains).
//since our frontend runs on a seperate server

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", rootRouter) //This line tells your Express application 
//to use the rootRouter for any requests that start with /api/v1.

app.listen(3001);