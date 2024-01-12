const express = require("express");
const mongoose = require("mongoose");
const profilemodel = require("../models/profilemodel");
const usermodel = require("../models/usermodel");
const suggestionmodel = require("../models/suggestionmodel");
const historymodel = require("../models/historymodel")
const authUser = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")

const router = express.Router();
router.use(authUser);

router.put("/update-profile", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const userExists = await usermodel.exists({ _id: userId });

    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingProfile = await profilemodel.findOne({ _id: userId });

    if (existingProfile) {

      const updatedProfile = req.body;
      const updatedDocument = await profilemodel.findOneAndUpdate(
        { _id: userId },
        updatedProfile,
        { new: true }
      );

      if (!updatedDocument) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      return res.status(200).json({ message: 'Profile updated successfully' });
    } else {

      const newProfileData = req.body;
      newProfileData._id = userId;

      const newProfile = new profilemodel(newProfileData);
      const savedProfile = await newProfile.save();

      if (!savedProfile) {
        return res.status(500).json({ message: 'Failed to save profile' });
      }

      return res.status(201).json({ message: 'Profile created successfully' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/delete-profile", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const deletedProfile = await profilemodel.findOneAndDelete({ _id: userId });

    if (!deletedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post("/dress-color-suggestion", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const userExists = await usermodel.exists({ _id: userId });

    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userProfile = await profilemodel.findOne({ _id: userId });

    if (!userProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const suggestedDressColor = suggestDressColors(userProfile);

    const newSuggestion = new historymodel({
      userId: userId,
      SuggestedDressColor: suggestedDressColor.Dreescolor,
      SuggestedHandbagColor: suggestedDressColor.handbag,
      SuggestedWatchColor: suggestedDressColor.watch,
      SuggestedShoe: suggestedDressColor.shoes,
    });

    await newSuggestion.save();
    res.status(200).json({ message: 'Suggestion added successfully' })

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/dress-color-suggestion/history", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const userExists = await usermodel.exists({ _id: userId });

    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }


    const userHistory = await historymodel.find({ userId: userId });

    res.status(200).json({ userHistory });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/dress-color-suggestion/history", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const userExists = await usermodel.exists({ _id: userId });

    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }


    const deleteResult = await historymodel.deleteMany({ userId: userId });

    if (deleteResult.deletedCount > 0) {
      res.status(200).json({ message: 'Suggestion history deleted successfully' });
    } else {
      res.status(404).json({ message: 'No suggestion history found for the user' });
    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/profile-details", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const userExists = await usermodel.exists({ _id: userId });

    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userProfile = await profilemodel.findOne({ _id: userId });

    if (!userProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ userProfile });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function suggestDressColors(userProfile) {

  const { favoriteColors, stylePreferences, handbagColor, watch, shoes } = userProfile;

  let suggestedColors = {
    Dreescolor: "Neutral",
    handbag: "Neutral",
    watch: "Neutral",
    shoes: "Neutral"
  };

  const getRandomColor = (colors, defaultColor) => {
    if (colors.length > 2) {
      const randomIndex = Math.floor(Math.random() * colors.length);
      return colors[randomIndex];
    }
    return colors[0] || defaultColor;
  };


  suggestedColors.Dreescolor = getRandomColor(favoriteColors, "White");
  suggestedColors.handbag = getRandomColor(handbagColor, "Brown");
  suggestedColors.watch = getRandomColor(watch, "Silver");
  suggestedColors.shoes = getRandomColor(shoes, "White");


  if (stylePreferences && stylePreferences.includes("Formal")) {

    suggestedColors.Dreescolor = getRandomColor(favoriteColors, "Blue");
    suggestedColors.handbag = getRandomColor(handbagColor, "Black");
    suggestedColors.watch = getRandomColor(watch, "Silver");
    suggestedColors.shoes = getRandomColor(shoes, "Black");
  } else if (stylePreferences && stylePreferences.includes("Casual")) {

    suggestedColors.Dreescolor = getRandomColor(favoriteColors, "Green");
    suggestedColors.handbag = getRandomColor(handbagColor, "Brown");
    suggestedColors.watch = getRandomColor(watch, "Gold");
    suggestedColors.shoes = getRandomColor(shoes, "White");
  }

  return suggestedColors;
}

router.get("/user-details", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const userExists = await usermodel.exists({ _id: userId });

    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await usermodel.findOne({ _id: userId });
    //const username = user.username;

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/delete-user", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const userExists = await usermodel.exists({ _id: userId });

    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }


    const confirmPassword = req.body.password;
    const existingUser = await usermodel.findOne({ _id: userId });

    if (!existingUser || !existingUser.password) {
      return res.status(404).json({ message: 'User not found or invalid password' });
    }

    const passwordMatches = await bcrypt.compare(confirmPassword, existingUser.password);

    if (passwordMatches) {
      const deleteResult = await usermodel.deleteOne({ _id: userId });
      if (deleteResult.deletedCount > 0) {
        res.status(200).json({ message: 'User deleted successfully' });
      } else {
        res.status(404).json({ message: 'No User found' });
      }
    } else {
      res.status(401).json({ message: 'Invalid Password' });
    }
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
