const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const userRouter = require("./routes/user.router");
const vehicleRoutes = require("./routes/vehicle.router");
const orderRoutes = require("./routes/order.router");
const ratingRoutes = require("./routes/rating.router"); // Include rating routes
const supportRoutes = require("./routes/supportTicket.router");
const reportsRoutes = require("./routes/reports.router");
const path = require("path");

const app = express();
require("dotenv").config();

app.use(cors());

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

app.use(helmet());

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));

app.use("/user", userRouter);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ratings", ratingRoutes); // Mount rating routes
app.use("/api/support", supportRoutes);
app.use("/api/reports", reportsRoutes);

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
