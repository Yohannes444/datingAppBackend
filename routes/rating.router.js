const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/rating.controller");
const authMiddleware = require("../middleware/Helpers/auth");

// Middleware to authenticate requests
router.use(authMiddleware.validate);

// Define rating management routes
router.post("/add", ratingController.addRating);
router.get("/driver/:driverId", ratingController.getDriverRatings);
router.get("/customer", ratingController.getCustomerRatings);
router.get("/:ratingId", ratingController.getRatingById);
router.put("/:ratingId/update", ratingController.updateRating);
router.delete("/:ratingId", ratingController.deleteRating);
router.get("/driver/:driverId/average", ratingController.getAverageRating);
router.get("/range", ratingController.getRatingsInRange);
router.get("/count", ratingController.countRatingsByValue);
router.get("/top-rated", ratingController.getTopRatedDrivers);

module.exports = router;
