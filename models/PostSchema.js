const mongoose = require("mongoose");

const shortUserSchema = new mongoose.Schema({
    userName: {
        type: String
    },
    email: {
        type: String
    },
    profile_image: {
        type: String
    },
    message: {
        type: String
    }
});

const postSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    profile_image: {
        type: String,
    },
    //////////
    post_image: {
        type: String,
    },
    post_image_url: {
        type: String,
    },
    post_name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    likes: [shortUserSchema],
    comments: [shortUserSchema],
    dateCreated: {
        type: String,
    },
    dateUpdated: Date
});

//model
const posts = new mongoose.model("posts", postSchema);

module.exports = posts;