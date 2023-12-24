const mysql = require("mysql2");
const db = () => {
  return mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "chintan@1710",
    database: "user",
    insecureAuth: true,
  });
};
module.exports = db;
