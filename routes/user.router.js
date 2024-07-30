const express = require("express");
const userController = require("../controllers/user.controller");
const helper = require("../middleware/Helpers/auth");

const router = express.Router();

router.post("/postuser", userController.postUser);
router.post("/login", userController.loginUser);
router.delete("/delete/:userId", helper.validate, userController.deleteUser);
router.put(
  "/changepassword/:userId",
  helper.validate,
  userController.updatePassword
);
router.get("/all", helper.validate, userController.getAllUsers);

module.exports = router;
