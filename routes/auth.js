const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

//REGISTER
router.post("/register", async (req, res) => {
  // Encrypt the password
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  });
  try {
    const user = await user.save();
    res.status(200).json(user); // new user successfully created and sent in JSON format
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    //find the username in database and store in user variable
    const user = await User.findOne({
      username: req.body.username,
    });
    // if no user send error
    !user && res.status(401).json("Wrong Credential");
    //if user compare the userpassword and encrypted password from database
    user && (await bcrypt.compare(req.body.password, user.password));

    //send the data of user but dont send PASSWORD
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (error) {}
});
module.exports = router;
