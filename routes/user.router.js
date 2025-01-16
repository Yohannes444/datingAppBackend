const express = require("express");
const userController = require("../controllers/user.controller");
const helper = require("../middleware/Helpers/auth");

const router = express.Router();

router.post("/signup", userController.postUser);
router.put("/approveuser/:userId", userController.approveUser);
router.put("/disableUser/:userId", userController.disableUser);
router.post("/login", userController.loginUser);
router.put("/addPrifereces/:userId",helper.validate, userController.addPreferenceToUser)
router.delete("/delete/:userId", helper.validate, userController.deleteUser);
router.put("/changepassword/:userId", helper.validate, userController.updatePassword);
router.put("/updateAvailability", helper.validate, userController.updateAvailability)
router.get("/", userController.getAllUsers);
router.get("/singluser/:userId", helper.validate , userController.getOneUser);
router.put('/update-location/:userId', userController.updateCurrentLocation);

module.exports = router;
