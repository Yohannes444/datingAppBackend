const express = require("express");
const userController = require("../controllers/user.controller");
const helper = require("../middleware/Helpers/auth");

const router = express.Router();

router.post("/postuser", userController.postUser);
router.post("/login", userController.loginUser);
router.delete("/delete", helper.validate, userController.deleteUser);
router.put(
  "/changepassword/:userId",
  helper.validate,
  userController.updatePassword
);

module.exports = router;
