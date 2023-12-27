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
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    //
    // Hash the password using bcrypt
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, (err, hashed) => {
        if (err) {
          console.error("Error in password hashing:", err);
          reject(err);
        } else {
          // console.log(hashed);
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

    // console.log(userID);
    // const refreshToken=jwt.sign({username:})
    // Send a success response
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
        .status(500)
        .json({ error: "UserName or email is not available" });
    }
    res
      .status(500)
      .json({ error: "Internal Server Error", errorcode: error.code });
  }
};

//login controller

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findUser(email, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
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
module.exports = {
  signup,
  login,
  refreshToken,
};
