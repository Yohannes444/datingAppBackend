const User = require("../../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("./config");
const SALT = 10;

const hashPassword = async (password) => {
  let salt = await bcrypt.genSalt(SALT);
  let hash = await bcrypt.hash(password, salt);
  return hash;
};

const hashCompare = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const createToken = async (payload) => {
  let token = await jwt.sign(payload, config.secret, { expiresIn: "3d" });
  return token;
};

const decodeToken = async (token) => {
  try {
    let data = await jwt.verify(token, config.secret);
    return data;
  } catch (error) {
    return new Error("Invalid Token");
  }
};

const validate = async (req, res, next) => {
  if (req.headers.authorization) {
    try {
      let token = req.headers.authorization.split(" ")[1].toString();
      let data = await decodeToken(token);

      const user = await User.findById(data.userId);

      if (user) { 
        req.user = user; // Assign the user object instead of the decoded token data

        next();
      } else {
        res.status(401).send({ message: "Invalid Credentials" });
      }
    } catch (error) {
      console.error("Error validating token:", error);
      res.status(401).send({ message: "Invalid Token" });
    }
  } else {
    res.status(400).send({
      message: "No Token Found",
    });
  }
};

const validateAdminOrSuperAdminOrCallCenter = async (req, res, next) => {
  if (req.headers.authorization) {
    let token = req.headers.authorization.split(" ")[1].toString();
    let data = await decodeToken(token);

    // Check the user
    const user = await User.findById(data.userId);

    if (user) {
      // Allow access for Admin, Super Admin, or Call Center roles
      if (
        user.role === "Admin" ||
        user.role === "Super Admin" ||
        user.role === "Call Center"
      ) {
        req.user = data;
        next();
      } else {
        res.status(401).send({ message: "Unauthorized" });
      }
    } else {
      res.status(401).send({ message: "Invalid Credentials" });
    }
  } else {
    res.status(400).send({
      message: "Error Login Again Please",
    });
  }
};

module.exports = {
  hashPassword,
  hashCompare,
  createToken,
  decodeToken,
  validate,
  validateAdminOrSuperAdminOrCallCenter,
};
