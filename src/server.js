const express = require("express");
const dotenv = require("dotenv");
const authroutes = require("./routes/authRoutes");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
dotenv.config();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.use("/auth", authroutes);
app.listen(PORT, () => {
  console.log("server is runing on port no " + PORT);
});
