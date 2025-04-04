const User = require("../models/user.model");
const nodemailer = require("nodemailer");
const helper = require("../middleware/Helpers/auth");
const { handleErrors } = require("../utils/errorHandler");
const { getRecommendedMatches } = require("../services/algoignms");
const mongoose = require("mongoose");
const SubscriptionController = require('../models/Subscription');
const cloudinary = require('cloudinary').v2;
const RandomMatch = require("../models/randommache");

require("dotenv").config();

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});




const uploadImageToCloudinary = (imageBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) {
          return reject(new Error('Error uploading image to Cloudinary'));
        }
        resolve(result.secure_url); // Resolve the promise with the image URL
      }
    );
    
    stream.end(imageBuffer); // Upload the image buffer to Cloudinary
  });
};

// Helper function to delete image from Cloudinary
const deleteImageFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        return reject(new Error('Error deleting image from Cloudinary'));
      }
      resolve(result);
    });
  });
};
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
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      if(user.Isverified === false){
        await sendEmail("verify your email",user);
        return res.status(400).send({ message: "your emil not verified" });  
      }
      console.log("user",user.password)
      console.log("password",password)
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

const uploadProfilepic = async (req, res) => {
  try {
    const  {userId}  = req.params;
    console.log("userId: ", userId);
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Upload file to Cloudinary
    const imageurl = await uploadImageToCloudinary(req.file.buffer);
    console.log("imageurl: ", imageurl);
    if (!imageurl) {
      return res.status(500).json({ error: "Failed to upload image" });
    }
    // Update user profile
    user.profilePic = imageurl;
    await user.save();
    return res.status(200).json({
      message: "Profile picture updated successfully",
      user,
    });
  }catch (error) {
    console.error("Error in uploadProfilepic:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

const uploadImagesOfuser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    let uploadedImages = [];
    for (const file of req.files) {
      const imageurl = await uploadImageToCloudinary(file.buffer);
      if (!imageurl) {
        return res.status(500).json({ error: "Failed to upload image" });
      }
      console.log("imageurl: ", imageurl);
      uploadedImages.push(imageurl);
    }
    user.images = uploadedImages;
    await user.save();
    return res.status(200).json({
      message: "Images uploaded successfully",
      user,
    });

    

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Edit profile (e.g., name, bio, etc.)
const editProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, bio } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update profile fields
    if (name) user.name = name;
    if (bio) user.bio = bio;

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Edit image list (replace existing images with new ones)
const editImageList = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete old images from Cloudinary if they exist
    if (user.images && user.images.length > 0) {
      for (const image of user.images) {
        await deleteImageFromCloudinary(image.publicId);
      }
    }

    // Upload new images
    let uploadedImages = [];
    for (const file of req.files) {
      const cloudinaryResult = await uploadImageToCloudinary(file.buffer);
      if (!cloudinaryResult.secure_url) {
        return res.status(500).json({ error: "Failed to upload image" });
      }
      uploadedImages.push({
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
      });
    }

    // Update user images
    user.images = uploadedImages;
    await user.save();

    return res.status(200).json({
      message: "Image list updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const turnOnUsersRandomeChat = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log("userId: ", userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.isRandemeChatOn = true;
    await user.save();
    
    const io = req.app.get('socketIo');
    console.log("Socket.io instance:", io);
    
    if (!io) {
      console.error("Socket.io is not initialized.");
      return res.status(500).json({ error: "Socket.io not initialized" });
    }
    const userSocketMap = req.app.get('userSocketMap');

    const matches = await getRecommendedMatches(userId, 50);
    console.log("matches: ", matches);
    
    if (!Array.isArray(matches)) {
      console.log("Matches is not an array:", matches);
      return res.status(500).json({ error: "Invalid matches data" });
    }

    // Filter for online users first
    const filteredOnlineMatches = matches.filter((match) => {
      console.log("match: ", match.user);
      console.log("match.user: ", match.user._id);
      if (match.user == null || match.user._id == null) {
        console.log("Invalid match object:", match);
        return false;
      }
      const matchId = match.user._id.toString();
      console.log("matchId: ", matchId);
      return userSocketMap.has(matchId);
    });

    console.log("filteredOnlineMatches: ", filteredOnlineMatches);

    if (filteredOnlineMatches.length > 0) {
      let selectedMatch = null;
      for (const match of filteredOnlineMatches) {
        if (!match.user || !match.user._id) {
          console.log("Invalid match object in loop:", match);
          continue;
        }
        
        // Fetch the full user document to check isRandemeChatOn
        const matchUser = await User.findById(match.user._id);
        if (!matchUser || matchUser.isRandemeChatOn !== true) {
          continue; // Skip if user not found or random chat is off
        }

        const randomUserId = match.user._id.toString();

        // Check existing RandomMatch
        const existingMatch = await RandomMatch.findOne({
          $or: [
            { member1: userId, member2: randomUserId },
            { member1: randomUserId, member2: userId }
          ]
        });

        if (existingMatch) {
          // If match exists and either user rejected, skip to next match
          if (existingMatch.user1WentToChatStatus === 'rejected' || 
              existingMatch.user2WentToChatStatus === 'rejected') {
            console.log(`Match between ${userId} and ${randomUserId} was rejected previously`);
            continue;
          }
        } else {
          // Create new RandomMatch if none exists
          const newMatch = new RandomMatch({
            member1: userId,
            member2: randomUserId,
            user1WentToChatStatus: 'unanswered',
            user2WentToChatStatus: 'unanswered'
          });
          await newMatch.save();
          console.log(`Created new RandomMatch between ${userId} and ${randomUserId}`);
        }

        // If we reach here, either there's a valid existing match or a new one was created
        selectedMatch = match;
        break; // Found a suitable match, exit loop
      }

      if (selectedMatch) {
        const randomUserId = selectedMatch.user._id.toString();
        console.log("randomUserId: ", randomUserId);
        const randomUserSocket = userSocketMap.get(randomUserId);
        console.log("randomUserSocket: ", randomUserSocket);
        
        if (randomUserSocket) {
          console.log("user id: ", user?._id?.toString());
          console.log("randomUserSocket type: ", typeof randomUserSocket);
          
          if (typeof randomUserSocket !== "string") {
            console.error("Invalid socket ID format:", randomUserSocket);
            return res.status(500).json({ error: "Invalid socket ID format" });
          }
          
          try {
            io.to(randomUserSocket).emit('randomMatch', {
              senderId: user?._id?.toString() || "unknown",
              receiverId: randomUserId || "unknown",
            });
            return res.status(200).json({ 
              message: 'Random match request sent',
              matchedUserId: randomUserId 
            });
          } catch (emitError) {
            console.error("Error emitting socket event:", emitError);
            return res.status(500).json({ error: "Error sending socket event" });
          }
        } else {
          console.log("No socket found for user:", randomUserId);
          return res.status(200).json({ message: 'Match found but not online' });
        }
      } else {
        console.log("No suitable matches found");
        return res.status(200).json({ 
          message: 'No online matches with random chat enabled found or all were previously rejected. Waiting for new matches.'
        });
      }
    } else {
      console.log("No online matches found. Total matches:", matches.length);
      return res.status(200).json({ 
        message: 'No online matches found. Waiting for matches to turn on random chat.'
      });
    }
  } catch (error) {
    console.error("Error in turnOnUsersRandomeChat:", error);
    return res.status(500).json({ error: error.message });
  }
};


const updateRandomMatch = async (req, res) => {
  try {
    const { userId, matchUserId, userWentToChatStatus } = req.body;

    // Validate input
    if (!userId || !matchUserId || !userWentToChatStatus) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate status value
    const validStatuses = ['unanswered', 'accepted', 'rejected'];
    if (!validStatuses.includes(userWentToChatStatus)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Find the existing RandomMatch
    const randomMatch = await RandomMatch.findOne({
      $or: [
        { member1: userId, member2: matchUserId },
        { member1: matchUserId, member2: userId }
      ]
    });

    if (!randomMatch) {
      return res.status(404).json({ error: "Random match not found" });
    }

    // Determine which member the userId corresponds to and update the appropriate status
    if (randomMatch.member1.toString() === userId) {
      randomMatch.user1WentToChatStatus = userWentToChatStatus;
    } else if (randomMatch.member2.toString() === userId) {
      randomMatch.user2WentToChatStatus = userWentToChatStatus;
    } else {
      return res.status(400).json({ error: "User ID does not match either member" });
    }

    // Save the updated document
    await randomMatch.save();

    return res.status(200).json({
      message: "Random match status updated successfully",
      updatedMatch: {
        member1: randomMatch.member1,
        member2: randomMatch.member2,
        user1WentToChatStatus: randomMatch.user1WentToChatStatus,
        user2WentToChatStatus: randomMatch.user2WentToChatStatus,
        createdAt: randomMatch.createdAt,
        updatedAt: randomMatch.updatedAt
      }
    });

  } catch (error) {
    console.error("Error in updateRandomMatch:", error);
    return res.status(500).json({ error: error.message });
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
  updateContactRequest,
  uploadProfilepic,
  uploadImagesOfuser,
  editProfile,
  editImageList,
  turnOnUsersRandomeChat,
  updateRandomMatch
};



