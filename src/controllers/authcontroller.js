const UserModel = require("../models/usermodel");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();
const jwt_secret = process.env.JWT_SECRETE;
const saltRounds = parseInt(process.env.SALTROUND);

// signup controller

const signup = async (req, res) => {
  const { username, password, confirmPassword, email } = req.body;
  try {
    console.log(password, confirmPassword, username, email);
    if (password !== confirmPassword) {
      return res.status(422).json({ errMessage: "Passwords do not match" });
    }
    // Hash the password using bcrypt
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, (err, hashed) => {
        if (err) {
          console.error("Error in password hashing:", err);
          reject(err);
        } else {
          resolve(hashed);
        }
      });
    });

    // Create a new user using the UserModel

    const userID = await UserModel.createUser(username, hashedPassword, email);
    const accesstoken = jwt.sign({ userID: userID }, jwt_secret, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ userId: userID }, jwt_secret, {
      expiresIn: "1d",
    });

    res.status(201).json({
      userId: userID,
      accesstoken: accesstoken,
      refreshToken: refreshToken,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error in signup controller:", error);
    if (error.code == "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ errMessage: "Email is allready registred Please Login" });
    }
    res
      .status(500)
      .json({ errMessage: "Internal Server Error", errorcode: error.code });
  }
};

//login controller

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findUser(email);
    if (!user) {
      return res.status(401).json({ errMessage: "Invalid Email and Password" });
    }
    const MatchPassword = await bcrypt.compare(password, user.password);
    if (MatchPassword) {
      const accesstoken = jwt.sign({ userId: user.user_id }, jwt_secret, {
        expiresIn: "1h",
      });
      const refreshToken = jwt.sign({ userId: user.user_id }, jwt_secret, {
        expiresIn: "1d",
      });

      res.status(200).json({
        message: `welcome ${user.username}`,
        accesstoken: accesstoken,
        refreshToken: refreshToken,
      });
    } else {
      return res.status(401).json({ errMessage: "Invalide Password" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ errMessage: "Internal server error" });
  }
};

//refresh jwt token
const refreshToken = (req, res) => {
  const { refreshtoken } = req.body;
  if (!refreshtoken) {
    return res.status(401).json({ errmessage: "Refreshtoken is missing!!" });
  }
  jwt.verify(refreshtoken, jwt_secret, (error, decoded) => {
    if (error) {
      res.status(403).json({ errmessage: "Invalid Refresh Token" });
    }
    const accesstoken = jwt.sign({ userID: decoded.userID }, jwt_secret, {
      expiresIn: "1h",
    });
    res.json({ accesstoken: accesstoken });
  });
};

//endpoint for get user data

const userData = async (req, res) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[0];
    if (!token) {
      return res.status(401).json({ errMessage: "Token is missing" });
    }
    const decoded = jwt.verify(token, jwt_secret);
    const userID = decoded.userID;
    const data = await UserModel.getUserData(userID);
    res.status(200).json({ data: data });
  } catch (error) {
    console.error("Error in userData:", error);
    if (error.name === "JsonWebTokenError") {
      res.status(403).json({ errMessage: "Invalid Token" });
    } else {
      res.status(500).json({ errMessage: "Internal Server Error" });
    }
  }
};

//end point for updatepassword

const updatePassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  try {
    if (password !== confirmPassword) {
      return res
        .status(422)
        .json({ errMessage: "Passwords do not match with comfirm password" });
    }
    // Hash the password using bcrypt
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, (err, hashed) => {
        if (err) {
          console.error("Error in password hashing:", err);
          reject(err);
        } else {
          resolve(hashed);
        }
      });
    });
    const result = await UserModel.updatePassword(hashedPassword, email);
    if (result.changedRows == 0) {
      return res.status(404).json({ errMessage: "Email is not registred" });
    } else {
      res.status(201).json({
        message: "Password Updated successfully",
      });
    }
  } catch (error) {
    console.error("Error in signup controller:", error);
    res
      .status(500)
      .json({ errMessage: "Internal Server Error", errorcode: error.code });
  }
};
module.exports = {
  signup,
  login,
  refreshToken,
  userData,
  updatePassword,
};
