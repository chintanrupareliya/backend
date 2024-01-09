const express = require("express");
const dotenv = require("dotenv");
const authroutes = require("./routes/authRoutes");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(bodyParser.json());
dotenv.config();
const PORT = process.env.PORT || 3030;
app.use(express.json());
app.use("/api/auth", authroutes);
app.use("/api/token", authroutes);
app.listen(PORT, () => {
  console.log("server is running on port no " + PORT);
});
