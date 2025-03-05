const express = require("express");
const userController = require("../controllers/user.controller");
const helper = require("../middleware/Helpers/auth");
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadmeltiple = multer({ storage: storage }).array('images', []);


const router = express.Router();

router.put("/updateprofile/:userId", upload.single("profile"), userController.uploadProfilepic);
router.put("/uploadmultiple/:userId", uploadmeltiple, userController.uploadImagesOfuser);
router.put("/updateprofile/:userId", upload.single("profile"), userController.editProfile)
router.put("/updatemultipleimages/:userId", uploadmeltiple, userController.editImageList)

router.put("/addpreference/:userId",userController.addUserPreference)
router.get("/getrecommendedmatches/:userId",userController.getRecommendedMatchesForUser)
router.post("/updatecontactrequest",helper.validate ,userController.updateContactRequest)
router.post("/signup", userController.postUser);
router.post("/addOdtStaff",helper.validateSuperAdmin, userController.addOdtStaff);
router.put("/approveuser/:userId", userController.approveUser);
router.put("/disableUser/:userId", userController.disableUser);
router.post("/login", userController.loginUser);
router.delete("/delete/:userId", helper.validate, userController.deleteUser);
router.put("/changepassword/:userId", helper.validate, userController.updatePassword);
router.put("/updateAvailability",helper.validate,userController.updateAvailability)
router.put('/update-location/:userId', userController.updateCurrentLocation);
router.put('/update-status/:userId/:status', userController.updateStatus);  
router.get('/getUsersByStatus/:status', userController.getUsersByStatus);
router.post('/verify-email/', userController.verifyEmail);    
router.get('/preferences/:userId',helper.validate,userController.getUserPreferences);
router.get('/displayable-preferences/:userId',helper.validate,userController.getUserDisplayablePreferences);
router.put('/update-user/:userId',userController.updateUserSexAndAge)
router.post("/contactRequest/:userId",helper.validate ,userController.AddcontactRequest)
router.get("/",helper.validate ,  userController.getAllUsers);

module.exports = router;
