const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/rating.controller");
const authMiddleware = require("../middleware/Helpers/auth");
const helper = require("../middleware/Helpers/auth");

// Middleware to authenticate requests
router.use(authMiddleware.validate);

// Define rating management routes
router.post("/add", helper.validate, ratingController.addRating);
router.get("/driver/:driverId", helper.validate, ratingController.getDriverRatings);
router.get("/customer", helper.validate, ratingController.getCustomerRatings);
router.get("/:ratingId", helper.validate, ratingController.getRatingById);
router.put("/:ratingId/update", helper.validate, ratingController.updateRating);
router.delete("/:ratingId", helper.validate, ratingController.deleteRating);
router.get("/driver/:driverId/average", helper.validate, ratingController.getAverageRating);
router.get("/range", helper.validate, ratingController.getRatingsInRange);
router.get("/count", helper.validate, ratingController.countRatingsByValue);
router.get("/top-rated", helper.validate, ratingController.getTopRatedDrivers);

module.exports = router;
