const mongoose = require("mongoose");

const profileSchema = mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    stylePreferences: { type: Array, required: true },  
    favoriteColors: { type: Array, required: true },
    handbagColor: { type: Array, required: true },
    watch: { type: Array, required: true },
    shoes: { type: Array, required: true },
},
{ timestamps: true }
);

const profilemodel = mongoose.model("Profile", profileSchema);

module.exports = profilemodel;
