require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT;
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");

//Connecting to mongoDb
mongoose
  .connect(process.env.MONGO_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(console.log("DbConnection successfull"))
  .catch(err => {
    console.log(err);
    process.exit(1); //exit process with failure
  });

// **** middleware ***
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);

//Connecting to Server at Port 4000
app.listen(PORT || 5000, () => {
  console.log(`Backend is running in ${PORT} port`);
});
