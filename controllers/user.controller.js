const User = require("../models/user.model");
const nodemailer = require("nodemailer");
const helper = require("../middleware/Helpers/auth");
const { handleErrors } = require("../utils/errorHandler");
const { getRecommendedMatches } = require("../services/algoignms");
const mongoose = require("mongoose");
const SubscriptionController = require('../models/Subscription');

require("dotenv").config();

// Email configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "jovclassy@gmail.com", // Replace with your email
        pass: "afbo ugsz zavj bqmu", // Replace with your app password
    },
});

const sendEmail = async (subject,user, otp) => {
    try {
        await transporter.sendMail({
            from: '"verify you email " <jovclassy@gmail.com>', // Replace with your email
            // to: "abrisira0116@gmail.com", // Replace with recipient's email
            to: `${user.email}`, // Replace with recipient's email

            subject,
            text: `Hello ${user.username} use this code to verify your email ${otp}`,
        });
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};
const postUser = async (req, res) => {
  try {
    const { password } = req.body;
    if(req.body != "admin"){
    const hashedPassword = await helper.hashPassword(password);
    const user = new User({
      ...req.body,
      password: hashedPassword,
    });
    const otp = `${Math.floor(Math.random() * 9) + 1}${Math.floor(10000 + Math.random() * 9000)}`;

    const datat={
      userId:user._id,
    }

    console.log("datat",datat)

    await new SubscriptionController(datat).save();

    await sendEmail("verify your email",user,otp);
    
    await user.save();
    const userOtp= {
      valuerequire:otp,
      IsUsed:false
    }
    user.otp = userOtp
    await user.save()
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
      if(user.Isverified === false){
        await sendEmail("verify your email",user);
        return res.status(400).send({ message: "your emil not verified" });  
      }
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
const updateStatus= async (req, res) => {
  try {
    const { userId,status } = req.params;
    if(status != "active" && status != "pending" && status != "inactive"){  
      return res.status(400).json({ error: 'Invalid status' });
    }
    const user = await User.findByIdAndUpdate({ _id: userId }, { status: status }, { new: true }); 
    res.json(user); 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

const getUsersByStatus= async (req, res) => {
  try {
    const { status } = req.params;
    const user = await User.find({status: status});
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyEmail= async (req, res) => {
  try {
    const { userId,otp } = req.body;
    const user = await User.findById(userId);  
    console.log("user",user.otp.valuerequire)
    console.log("otp",otp)
    if(`${user.otp.valuerequire}` === otp){
      user.otp.IsUsed = true;
      user.Isverified = true;
      await user.save();
      res.status(200).json({ status: "ok", message: "Email verified successfully" });
    }else{
      res.status(400).json({ message: "Invalid otp" });
    }
    } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


// Get a single user's preferences
const getUserPreferences = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from the query params
    const user = await User.findById(userId, 'preferences') // Fetch only the preferences field
      .populate({
        path: 'preferences.preferenceId', // Populate the `preferenceId` field
        select: 'name description', // Adjust fields based on your Preference model
      });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', data: user.preferences });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Get a single user's preferences where `displayPreference` is `true`
const getUserDisplayablePreferences = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from the query params
    const user = await User.findById(userId, 'preferences') // Fetch only the preferences field
      .populate({
        path: 'preferences.preferenceId', // Populate the `preferenceId` field
        select: 'name description', // Adjust fields based on your Preference model
      });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Filter preferences where `displayPreference` is true
    const displayablePreferences = user.preferences.filter(
      (pref) => pref.displayPreference
    );

    res.status(200).json({ status: 'success', data: displayablePreferences });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const updateUserSexAndAge = async (req, res) => {
  try {
    const { userId } = req.params;
    const {sex, birthday} = req.body;
    const user = await User.findById(userId);
    user.sex= sex;
    user.birthday= birthday;
    await user.save();
    res.status(200).json({ status: "ok", message:"User updated successfully" });  
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
const getRecommendedMatchesForUser= async (req, res) => {
  try {
    const { userId } = req.params;
    const radius = req.query.radius ? parseFloat(req.query.radius) : 50; // Default to 50km

    const matches = await getRecommendedMatches(userId, radius);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const addUserPreference = async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferences } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    preferences.forEach(({ preferenceID, values }) => {
      const existingPreference = user.preferences.find((pref) => 
        pref.preferenceId.toString() === preferenceID
      );

      if (existingPreference) {
        // Replace the values if preference already exists
        existingPreference.values = values;
      } else {
        // Add new preference if it doesn't exist
        user.preferences.push({
          preferenceId: preferenceID,
          values,
        });
      }
    });

    await user.save();
    res.status(200).json({ message: "Preferences updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const AddcontactRequest= async (req, res) => {
  try {
    const { userId } = req.params;
    const { _id } = req.user;
    const user = await User.findById(_id);
    if(user.contactRequset.includes(userId)){
      return res.status(400).json({ message: "contact request already sent" });
    }
    user.contactRequset.push(userId);
    await user.save();
    res.status(200).json({ status: "ok", message:"contact request send successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

const updateContactRequest= async (req, res) => {
  try{
    const { userId, status } = req.body;
    const { _id } = req.user;
    const user = await User.findById(_id);
    const userObjectId =new mongoose.Types.ObjectId(userId);
    const findUserFromContactList = user.contactList.find((item) => item.equals(userObjectId));
    const findUserFromContactRequest = user.contactRequset.find((item) => item.equals(userObjectId));
 
    if(findUserFromContactList){
      return res.status(400).json({ message: "user already in contact list" });
    }else if(!findUserFromContactRequest){
      return res.status(400).json({ message: "contact request not found" });
    }

    else if(status === "accepted" ){
      user.contactList.push(userId);
      user.contactRequset = user.contactRequset.filter((item) => !item.equals(userObjectId));
      await user.save();
      res.status(200).json({ status: "ok", message:"contact request accepted successfully" });
  } else if(status === "rejected"){
    user.contactRequset = user.contactRequset.filter((item) => item !== userId);
    await user.save();
    res.status(200).json({ status: "ok", message:"contact request rejected successfully" });
  }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

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
  updateCurrentLocation,
  updateStatus,
  getUsersByStatus,
  verifyEmail,
  getUserPreferences,
  getUserDisplayablePreferences,
  updateUserSexAndAge,
  getRecommendedMatchesForUser,
  addUserPreference,
  AddcontactRequest,
  updateContactRequest
};
