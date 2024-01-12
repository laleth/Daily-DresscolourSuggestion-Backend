const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const usermodel = require("../models/usermodel");
const nodemailer = require("nodemailer")


const router = express.Router();



router.post("/register", async (req, res) => {
    try {

        const existinguser = await usermodel.findOne({ username: req.body.username })

        if (existinguser) {
            return res.status(400).json({ message: "User Already Exists" })
        }

        if (!/^(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[#!@%$_]).{8,}$/g.test(req.body.password)) {
            res.send({ message: 'Password Pattern does not match' })
            return
        }

        const hashedPassword = await genhashedPassword(req.body.password)
        const newuser = await new usermodel({ username: req.body.username, password: hashedPassword, email: req.body.email })
        await newuser.save()

        res.send("User Registered Successfully")
    } catch (error) {
        res.status(400).json(error)
    }
});


router.post("/login", async (req, res) => {
    try {
        const existingUser = await usermodel.findOne({ email: req.body.email });

        if (!existingUser) {
            return res.status(400).json({ message: "User Not found" })
        }

        const isValidPassword = await bcrypt.compare(req.body.password, existingUser.password)

        if (!isValidPassword) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }

        const token = jwt.sign({ id: existingUser._id }, process.env.SECRET_KEY)
        res.send({ message: "Login Successful", token: token })

    } catch (error) {
        res.status(400).json(error)
    }
});

router.post("/reset-code-request", async (req, res) => {
    try {
        
        const existingUser = await usermodel.findOne({ email: req.body.email });

        if (!existingUser) {
            return res.status(400).json({ message: "User Not found" });
        }

        
        const resetcode = Math.floor(100000 + Math.random() * 900000).toString();

        
        existingUser.resetcode = resetcode;
        await existingUser.save();

        
        await sendResetCodeByEmail(existingUser.email, resetcode);

        res.send({ message: "Reset code sent successfully" });
    } catch (error) {
        res.status(400).json(error);
    }
});


router.post("/reset-password", async (req, res) => {
    try {
        const { email, resetcode, newPassword } = req.body;

        console.log(email);
        console.log(resetcode);
        console.log(newPassword);

        if (!email || !resetcode || !newPassword) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        
        const existingUser = await usermodel.findOne({ email, resetcode });

        if (!existingUser) {
            return res.status(400).json({ message: "Invalid or expired reset code" });
        }

        existingUser.password = await genhashedPassword(newPassword);
        existingUser.resetCode = undefined; 
        try {
            await existingUser.validate();
        } catch (validationError) {
            return res.status(400).json({ message: validationError.message });
        }

        await existingUser.save();

        res.send({ message: "Password reset successful" });
    } catch (error) {
        res.status(400).json(error);
    }
});


async function sendResetCodeByEmail(email, resetcode) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "trlaleth@gmail.com",
                pass: "jfxkyfhoyjugdhve",
            },
        });

        const mailOptions = {
            from: "trlaleth@gmail.com",
            to: email,
            subject: "Password Reset Code",
            text: `Your password reset code is: ${resetcode}`,
        };

        await transporter.sendMail(mailOptions);
        console.log("Reset code email sent successfully");
    } catch (error) {
        console.error("Error sending reset code email:", error);
        throw error;
    }
}

async function genhashedPassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
}

module.exports = router