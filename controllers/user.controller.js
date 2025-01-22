const User = require("../models/user.model");
const helper = require("../middleware/Helpers/auth");
const { handleErrors } = require("../utils/errorHandler");



const postUser = async (req, res) => {
  try {
    console.log(req.body)
    const { password } = req.body;
    if(req.body != "warhouse_manager" && req.body != "agent" && req.body != "super_admin"){
    const hashedPassword = await helper.hashPassword(password);
    const user = new User({
      ...req.body,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({ user: user, status: "ok" });
  }else{
    res.send("you can note this user")
  }
  } catch (err) {
    handleErrors(err, res);
  }
};

const addOdtStaff = async (req, res) => {
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
    const { email, Password } = req.body;
    const user = await User.findOne({ email });



    if (user) {
      if (await helper.hashCompare(Password, user.password)) {
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
        message: `A user with phone number ${email} does not exist`,
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
    res.status(500).json({ message: "Server error", error: error });
  }
};

const approveUser= async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate({ _id: userId }, { active: true }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
const disableUser= async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate({ _id: userId }, { active: false }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

const updateAvailability= async (req, res)=>{
  try{
    const userId = req.body.userId
    const user = await User.findById(userId);
    if (user.role === "driver" ){
      user.isAvailable = req.body.isAvailable;
      await user.save();
      res.status(200).json({ status: "ok", message: "Availability updated successfully" });
    }else{
      res.send("user is not driver")
    }
  }catch (err){
    res.status(500).json({ message: err.message });
  }
}

const updateCurrentLocation = async (req, res) => {
  const { userId } = req.params; // Get the user's ID from the route parameters
  const { latitude, longitude } = req.body; // Get latitude and longitude from the request body

  try {
    // Validate inputs
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Find the user and update their current location
    const user = await User.findByIdAndUpdate(
      userId,
      { 'locations.currentLocation': { latitude, longitude } },
      { new: true } // Return the updated user
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Location updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};
module.exports = {
  postUser,
  loginUser,
  deleteUser,
  updatePassword,
  getAllUsers,
  approveUser,
  disableUser,
  updateAvailability,
  addOdtStaff,
  updateCurrentLocation
};
