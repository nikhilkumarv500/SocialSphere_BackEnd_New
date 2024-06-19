const mongoose = require("mongoose");
const validator = require("validator");

const shortUserSchema = new mongoose.Schema({
    userName: {
        type: String
    },
    email: {
        type: String
    },
    profile_image: {
        type: String
    }
});

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    money: {
        type: Number,
    }
})

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validator(value){
            if(!validator.isEmail(value))
            {
                throw Error("Invalid Email");
            }
        }
    },
    mobile: {
        type: String,
        required: true,
        // minlength: 10,
        // maxlength: 10
    },
    profile_image: {
        type: String,
    },
    user_description: {
        type: String,
    },
    connections: [shortUserSchema],
    requests: [shortUserSchema],
    money:{
        type: Number
    },
    coupons:[couponSchema],
    dateCreated: Date,
    dateUpdated: Date
});

//model
const users = new mongoose.model("users", userSchema);

module.exports = users;