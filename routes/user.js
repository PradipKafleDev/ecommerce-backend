const User = require("../models/User");
const {
  verifyToken,
  verifyTokenAuthorization,
  verifyTokenAndAdmin,
} = require("./verifytoken");

const router = require("express").Router();

//Edit || Update User
router.put("/:id", verifyTokenAuthorization, async (req, res) => {
  if (req.body.password) {
    //encrypting the password
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.HASHED_PSW
    ).toString();
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

//DElETING USER
router.delete("/:id", verifyTokenAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted......");
  } catch (error) {
    res.status(500).json(error);
  }
});

//GET Single User By admin
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json({ ...others });
  } catch (error) {
    res.status(500).json(error);
  }
});

//Get All users by admin
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? //sorted to return latest user else return all user
        await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

//GET User Stats

router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1)); //2021-11-21T06:12:03.592Z
  try {
    const data = await User.aggregate([
      //match=> filter those documents we need to work with, those that fits our need
      { $match: { createdAt: { $gte: lastYear } } },
      {
        //It is rare that we ever need to retrieve all the fields in our documents. so we retrive only month
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      //does the aggregation job we can peform counts, total, averages or maximums
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
