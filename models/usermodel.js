const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, require: true },
    email: { type: String, required: true },
    resetcode: { type: String}
},
    { timestamps: true }
)

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;