const User = require("../models/User");
const router = require("express").Router();
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    //converting password into hashedpassword using cipher algorithm Advanced Encrypted Standard
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.HASHED_PSW
    ).toString(),
  });
  try {
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    //finding user in the database with the usernmae given in body
    const user = await User.findOne({
      username: req.body.username,
    });
    !user && res.status(401).json("Wrong Credential");
    //converting password into original form
    const originalPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.HASHED_PSW
    ).toString(CryptoJS.enc.Utf8);

    originalPassword !== req.body.password &&
      res.status(401).json("Wrong Credential");

    // Creating jwt token
    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWTSECRET_KEY,
      { expiresIn: "3d" }
    );

    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, accessToken });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
