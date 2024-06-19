const mongoose = require("mongoose");
const validator = require("validator");

const userPasswordSchema = new mongoose.Schema({
    email: {
        type: String,
        // required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        // required: true,
    },
});

//model
const userPassword = new mongoose.model("userpasswords", userPasswordSchema);

module.exports = userPassword;