const User = require("../models/user.model");
const helper = require("../middleware/Helpers/auth");
const { handleErrors } = require("../utils/errorHandler");

const postUser = async (req, res) => {
  try {
    const { password } = req.body;
    const hashedPassword = await helper.hashPassword(password);
    const user = new User({
      ...req.body,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({ user: user, status: "ok" });
  } catch (err) {
    handleErrors(err, res);
  }
};

const loginUser = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const user = await User.findOne({ phoneNumber });

    if (user) {
      if (await helper.hashCompare(password, user.password)) {
        const token = await helper.createToken({
          userId: user._id,
          role: user.role,
        });

        res.status(200).send({
          message: "Login Successful!",
          token,
          user,
        });
      } else {
        res.status(400).send({ message: "Invalid Credentials" });
      }
    } else {
      res.status(400).send({
        message: `A user with phone number ${phoneNumber} does not exist`,
      });
    }
  } catch (error) {
    handleErrors(error, res);
  }
};
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Attempt to find and delete the user by ID
    const result = await User.findByIdAndDelete(userId);

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ status: "ok", message: "User deleted successfully" });
  } catch (err) {
    handleErrors(err, res);
  }
};

// Get all Employees List
const getAllUsers = async (req, res) => {
  try {
    const user = await User.find();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Update Password
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    // if (!validator.isStrongPassword(newPassword)) {
    //   throw Error("The New Password is not strong enough");
    // }
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate({ _id: userId });
    if (await helper.hashCompare(currentPassword, user.password)) {
      const newHashedPass = await helper.hashPassword(newPassword);
      await User.updateOne(
        { _id: userId },
        { password: newHashedPass },
        { new: true }
      );
      res
        .status(200)
        .json({ status: "ok", message: "Password Changed Sucessfully" });
    } else {
      res.status(400).json({ message: "Error Incorrect Password Entered" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error });
  }
};

module.exports = {
  postUser,
  loginUser,
  deleteUser,
  updatePassword,
  getAllUsers,
};
