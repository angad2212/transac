const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const  { authMiddleware } = require("../middleware");
const { User, Account } = require("../db"); //importing the user form the database

const router = express.Router();

const signupBody= zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
})

router.post('/signup', async (req,res)=> { //tested
    const {success} = signupBody.safeParse(req.body)
    // if(!success){
    //     return res.status(411).json({
    //         message: "email already taken/incorrect inputs"
    //     })
    // }

    const existingUser = await User.findOne({
        username: req.body.username
    })
    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken/ existing user"
        })
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })
    const userId = user._id;

    // to give the user a random balance between 1 and 10000
    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET);
    //jwt.sign() is a method provided by the JWT library to create (or sign) a new token. 
    //This method takes two main arguments:
    //Payload: The data you want to include in the token. 
    //Secret Key: A secret string (JWT_SECRET) used to sign the token. 

    res.json({
        message: "User created successfully",
        token: token
    })
})


const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string()
});

router.post('/signin', async (req, res) => { //tested
  const { success } = signinBody.safeParse(req.body);
  if (!success) {
      return res.status(400).json({
          message: "Invalid input format"
      });
  }

  const user = await User.findOne({
      username: req.body.username,
      password: req.body.password
  });

  if (user) {
      const token = jwt.sign({
          userId: user._id
      }, JWT_SECRET);

      res.json({
          token: token
      });
      return;
  }

  res.status(401).json({
      message: "Invalid username or password"
  });
});


const updateBody = zod.object({
	password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.put('/', authMiddleware, async (req, res) => { //gives error
  try {
    const { success, error } = updateBody.safeParse(req.body);

    if (!success) {
      return res.status(400).json({
        message: "Error while updating the values",
        error: error.issues,
      });
    }

    const { username, ...updateFields } = req.body;

    const result = await User.updateOne({ _id: req.userId }, updateFields);

    if (result.nModified === 0) {
      return res.status(404).json({ message: "User not found or no data changed" });
    }

    res.json({ message: "Updated successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: `Duplicate value error for ${Object.keys(err.keyPattern).join(", ")}`,
        keyValue: err.keyValue,
      });
    }
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/bulk", async (req, res) => { //tested
  const filter = req.query.filter || "";

  const users = await User.find({
      $or: [{
          firstName: {
              "$regex": filter
          }
      }, {
          lastName: {
              "$regex": filter
          }
      }]
  })

  res.json({
      user: users.map(user => ({
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          _id: user._id
      }))
  })
})


module.exports = router;