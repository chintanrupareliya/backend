const db = require("../DB/db");
const dbconnect = db();

//function for insert new user data to database

const createUser = async (username, password, email) => {
  console.log("createuser");
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
    console.log(result);
    return result.insertId;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const findUser = async (email, password) => {
  const query = "SELECT * FROM login_info WHERE email=? LIMIT 1";
  try {
    console.log(query);
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
module.exports = { createUser, findUser };
