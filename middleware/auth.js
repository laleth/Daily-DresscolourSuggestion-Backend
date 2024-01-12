const jwt = require('jsonwebtoken');
const User = require("../models/usermodel");
const mongoose = require("mongoose")
const secretKey = process.env.SECRET_KEY; 

const authUser = async (req, res, next) => {
  const token = req.header('Authorization') || req.header('x-auth-token');
  //console.log(token);

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Missing token' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    // console.log('Decoded Token:', decoded); 

    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ message: 'Unauthorized: Token has expired' });
    }

    const userId = new mongoose.Types.ObjectId(decoded.id);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    req.user = { id: user._id, username: user.username }; 
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = authUser;
