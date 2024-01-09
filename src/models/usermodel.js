const db = require("../DB/db");
const dbconnect = db();

//function for insert new user data to database

const createUser = async (username, password, email) => {
  const q =
    "INSERT INTO login_info(username, password, email) VALUES (?, ?, ?)";
  try {
    const result = await new Promise((resolve, reject) => {
      dbconnect.query(q, [username, password, email], (err, result) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    return result.insertId;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const findUser = async (email) => {
  const query = "SELECT * FROM login_info WHERE email=? LIMIT 1";
  try {
    const user = await new Promise((resolve, reject) => {
      dbconnect.query(query, [email], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    return user[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getUserData = async (user_id) => {
  const query =
    "SELECT user_id,username,email FROM login_info WHERE user_id=? LIMIT 1";
  try {
    const user = await new Promise((resolve, reject) => {
      dbconnect.query(query, [user_id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    return user[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const updatePassword = async (password, email) => {
  const query = "UPDATE login_info SET password=? WHERE email=?";
  try {
    const result = await new Promise((resolve, reject) => {
      dbconnect.query(query, [password, email], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
module.exports = { createUser, findUser, getUserData, updatePassword };
