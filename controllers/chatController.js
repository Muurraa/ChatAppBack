const Chat = require('../schemas/chatSchema');

function validateMessageLength(message) {
    return message && message.length >= 3 && message.length <= 1000
}

exports.sendMessage = async (req, res) => {
    const { sender, receiver, message } = req.body
    if (!validateMessageLength(message)) {
        return res.status(400).json({ success: false, message: 'Message must be between 3 and 1000 characters.' })
    }
    try {
        let chat = await Chat.findOne({
            $and: [
                { 'users.name': sender.name },
                { 'users.name': receiver.name }
            ]
        })
        if (!chat) {
            chat = new Chat({
                users: [sender, receiver],
                messages: []
            })
        }
        chat.messages.push({
            sender: sender.name,
            text: message,
            timestamp: new Date()
        })
        await chat.save()
        res.status(200).json({ success: true, message: 'Message sent' })
    } catch (error) {
        console.error('Failed to send message:', error)
        res.status(500).json({ success: false, message: error })
    }
}

exports.getChatHistory = async (req, res) => {
    const {sender, receiver} = req.query
    try {
        const chat = await Chat.findOne({users: {$all: [sender, receiver]}})
        if (!chat) {
            return res.status(404).json({success: false, message: 'Chat not found'})
        }
        res.status(200).json({success: true, chat})
    } catch (error) {
        console.error('Failed to fetch chat history:', error)
        res.status(500).json({success: false, message: 'Failed to fetch chat history'})
    }
}

exports.getUserConversations = async (req, res) => {
    const { username } = req.query
    try {
        const conversations = await Chat.find({
            'users': {
                $elemMatch: { 'name': username }
            }
        })
        res.status(200).json({ success: true, conversations })
    } catch (error) {
        console.error('Failed to fetch user conversations:', error)
        res.status(500).json({ success: false, message: 'Failed to fetch user conversations' })
    }
}
