const express = require("express");
const userController = require("../controllers/user.controller");
const helper = require("../middleware/Helpers/auth");

const router = express.Router();

router.get('/get-recommended-matches/:userId',userController.getRecommendedMatchesForUser)
router.put("/addpreference/:userId",userController.addUserPreference)
router.post("/signup", userController.postUser);
router.post("/addOdtStaff",helper.validateSuperAdmin, userController.addOdtStaff);
router.put("/approveuser/:userId", userController.approveUser);
router.put("/disableUser/:userId", userController.disableUser);
router.post("/login", userController.loginUser);
router.delete("/delete/:userId", helper.validate, userController.deleteUser);
router.put("/changepassword/:userId", helper.validate, userController.updatePassword);
router.put("/updateAvailability",helper.validate,userController.updateAvailability)
router.get("/",  userController.getAllUsers);
router.put('/update-location/:userId', userController.updateCurrentLocation);
router.put('/update-status/:userId/:status', userController.updateStatus);  
router.get('/getUsersByStatus/:status', userController.getUsersByStatus);
router.post('/verify-email/', userController.verifyEmail);    
router.get('/preferences/:userId',helper.validate,userController.getUserPreferences);
router.get('/displayable-preferences/:userId',helper.validate,userController.getUserDisplayablePreferences);
router.put('/update-user/:userId',userController.updateUserSexAndAge)

module.exports = router;
