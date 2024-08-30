// server.js
const express = require("express");
const cors = require("cors");
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require("body-parser");
const helmet = require("helmet");
const userRouter = require("./routes/user.router");
const vehicleRoutes = require("./routes/vehicle.router");
const orderRoutes = require("./routes/order.router");
const ratingRoutes = require("./routes/rating.router");
const supportRoutes = require("./routes/supportTicket.router");
const reportsRoutes = require("./routes/reports.router");
const companyRoutes = require("./routes/company.router");
const path = require("path");
const warehouse = require("./routes/warehouseRoutes");
const walletRoutes  =   require("./routes/wallet.router")
const Transaction = require("./routes/transaction.router")
const serviceRoutes = require('./routes/serviceRoutes');


const app = express();
require("dotenv").config();

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

app.use("/user", userRouter);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/warehouse", warehouse);
app.use("/api/wallet",walletRoutes)
app.use("/api/transaction",Transaction)
app.use("/api/service",serviceRoutes)

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }
});

const deviceLocations = [];
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('sendLocation', (data) => {
    console.log('Received location:', data);
    deviceLocations[socket.id] = data;
    console.log("llll",deviceLocations) // Update deviceLocations with the received data
    io.emit('updateLocations', deviceLocations);
  });

  socket.on('notifydriver', (data) => {
    console.log('Received location:', data);
    
    deviceLocations[socket.id] = data; // Update deviceLocations with the received data
    io.emit('orderUpdated', data)
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    delete deviceLocations[socket.id]; // Remove disconnected device's location
  });
});

// Export the Socket.IO instance
module.exports = { io };

// Start the server
server.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
