const User = require("../../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("./config");
const CryptoJS = require("crypto-js");
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
  const encryptedToken = CryptoJS.AES.encrypt(token, config.secret).toString();
  return encryptedToken;

};

const decodeToken = (encryptedToken) => {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, config.secret);
  const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);

  try {
    const decoded = jwt.verify(decryptedToken, config.secret);
    return decoded;
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

const validateAdmin = async (req, res, next) => {
  if (req.headers.authorization) {
    try {
      let token = req.headers.authorization.split(" ")[1].toString();
      let data = await decodeToken(token);

      const user = await User.findById(data.userId);

      if (user && user.role === "admin") { 
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






module.exports = {
  hashPassword,
  hashCompare,
  createToken,
  decodeToken,
  validate,
  validateAdmin,

};
