const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    users: [{
        name: String,
        userPicture: String,
        id: String
    }],
    messages: [{
        sender: String,
        text: String,
        timestamp: Date
    }]
})

module.exports = mongoose.model('Chat', chatSchema);