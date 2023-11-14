const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    id: String,
    image: String,
    title: String,
    creator: {
        name: String,
        picture: String,
    },
    comments: [{
        name: String,
        comment: String,
    }],
    likes: [{
        name: String
    }],
    date: { type: Date, default: Date.now },

})

module.exports = mongoose.model('Post', postSchema);
