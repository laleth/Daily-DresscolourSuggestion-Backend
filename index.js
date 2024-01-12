const express = require("express");
const mongoose = require("mongoose")
const dotenv = require("dotenv").config()
const userRoute = require("./routes/userroute")
const profileRoute = require("./routes/profileroute")
const cors = require("cors")

const app = express()
const PORT = 5000


app.use(express.json())
app.use(cors({
    origin: "https://rad-cocada-d11bc6.netlify.app", 
    credentials: true,
  }))


app.get('/',(req,res)=>{
    res.send("Welcome to Daily Dress Color Suggestion")
})

app.use("/users",userRoute)
app.use("/profile",profileRoute)

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("Mongoose is Connected")
    app.listen(PORT,()=>console.log(`Server connected on the PORT ${PORT}`))
}).catch((error)=>{
    console.log(error.message)
})