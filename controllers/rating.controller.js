const Rating = require("../models/rating.model");
const Order = require("../models/order.model");

// Add a new rating
exports.addRating = async (req, res) => {
  try {
    const { driverId, orderId, rating, review } = req.body;
    const customer = req.user.id;

    // Check if the order exists and belongs to the customer
    const order = await Order.findOne({ _id: orderId, customer });

    if (!order) {
      return res
        .status(404)
        .json({ error: "Order not found or does not belong to the customer" });
    }

    // Check if the driver is assigned to the order
    if (order.driver.toString() !== driverId) {
      return res
        .status(400)
        .json({ error: "Driver not assigned to this order" });
    }

    const newRating = new Rating({
      customer,
      driver: driverId,
      order: orderId,
      rating,
      review,
    });

    await newRating.save();
    res
      .status(201)
      .json({ message: "Rating added successfully", rating: newRating });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error adding rating", details: error.message });
  }
};
// Get ratings for a specific driver
exports.getDriverRatings = async (req, res) => {
  try {
    const driverId = req.params.driverId;
    const ratings = await Rating.find({ driver: driverId })
      .populate("customer", "name")
      .populate("order", "pickupLocation deliveryLocation");
    res.status(200).json(ratings);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error fetching ratings", details: error.message });
  }
};
// Get ratings given by the authenticated customer
exports.getCustomerRatings = async (req, res) => {
  try {
    const customer = req.user.id;
    const ratings = await Rating.find({ customer })
      .populate("driver", "name")
      .populate("order", "pickupLocation deliveryLocation");
    res.status(200).json(ratings);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error fetching ratings", details: error.message });
  }
};
// Get rating details by ID
exports.getRatingById = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const rating = await Rating.findById(ratingId)
      .populate("customer", "name")
      .populate("driver", "name")
      .populate("order", "pickupLocation deliveryLocation");

    if (!rating) {
      return res.status(404).json({ error: "Rating not found" });
    }

    res.status(200).json(rating);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error fetching rating details", details: error.message });
  }
};
// Update a rating
exports.updateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { rating, review } = req.body;

    const updatedRating = await Rating.findByIdAndUpdate(
      ratingId,
      { rating, review },
      { new: true }
    );

    if (!updatedRating) {
      return res.status(404).json({ error: "Rating not found" });
    }

    res
      .status(200)
      .json({ message: "Rating updated successfully", rating: updatedRating });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error updating rating", details: error.message });
  }
};
// Delete a rating
exports.deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;

    const deletedRating = await Rating.findByIdAndDelete(ratingId);

    if (!deletedRating) {
      return res.status(404).json({ error: "Rating not found" });
    }

    res.status(200).json({ message: "Rating deleted successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error deleting rating", details: error.message });
  }
};
// Get average rating for a specific driver
exports.getAverageRating = async (req, res) => {
  try {
    const driverId = req.params.driverId;
    const averageRating = await Rating.aggregate([
      { $match: { driver: driverId } },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } },
    ]);

    if (averageRating.length === 0) {
      return res
        .status(404)
        .json({ error: "No ratings found for this driver" });
    }

    res.status(200).json({ averageRating: averageRating[0].averageRating });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error fetching average rating", details: error.message });
  }
};
// Get ratings within a specific range
exports.getRatingsInRange = async (req, res) => {
  try {
    const { minRating, maxRating } = req.query;

    const ratingsInRange = await Rating.find({
      rating: { $gte: parseInt(minRating), $lte: parseInt(maxRating) },
    })
      .populate("customer", "name")
      .populate("driver", "name")
      .populate("order", "pickupLocation deliveryLocation");

    res.status(200).json(ratingsInRange);
  } catch (error) {
    res
      .status(400)
      .json({
        error: "Error fetching ratings in range",
        details: error.message,
      });
  }
};
// Count ratings by rating value
exports.countRatingsByValue = async (req, res) => {
  try {
    const ratingsCount = await Rating.aggregate([
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]);

    res.status(200).json(ratingsCount);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error counting ratings", details: error.message });
  }
};
// Get top rated drivers
exports.getTopRatedDrivers = async (req, res) => {
  try {
    const topDrivers = await Rating.aggregate([
      { $group: { _id: "$driver", averageRating: { $avg: "$rating" } } },
      { $sort: { averageRating: -1 } },
      { $limit: 10 },
    ])
      .lookup({
        from: "users", // Assuming 'users' collection has driver details
        localField: "_id",
        foreignField: "_id",
        as: "driverDetails",
      })
      .project({
        _id: 1,
        averageRating: 1,
        driverDetails: { $arrayElemAt: ["$driverDetails", 0] },
      })
      .addFields({
        "driverDetails.name": "$driverDetails.fullName",
        "driverDetails.email": "$driverDetails.email",
      });

    res.status(200).json(topDrivers);
  } catch (error) {
    res
      .status(400)
      .json({
        error: "Error fetching top rated drivers",
        details: error.message,
      });
  }
};
