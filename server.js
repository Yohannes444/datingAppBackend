// server.js
const express = require("express");
const cors = require("cors");
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require("body-parser");
const helmet = require("helmet");
const { Server } = require('socket.io');

const chatRoutes = require('./routes/chatRoutes');
const userRouter = require("./routes/user.router");
const preferences = require("./routes/preference.router")
const subscription = require("./routes/subscriptionRoutes")
const socketService = require('./services/socketService');
const checkSubscriptions = require('./cron/subscriptionJob');

const path = require("path");


const app = express();
require("dotenv").config();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const PORT = process.env.PORT || 4000;
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});
db.once("open", () => {
  console.log("Connected to MongoDB");
});


// Serve static files from the 'public' folder standard
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));

//cron jobs
checkSubscriptions();

// routes
app.use("/user", userRouter);
app.use("/preferences",preferences)
app.use('/chats', chatRoutes);
app.use("/subscription", subscription);

app.get("/",((req,res)=>{
  res.send("hellow")
}))

// Create HTTP server and attach Socket.IO

socketService(io);

// Start the server
server.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
