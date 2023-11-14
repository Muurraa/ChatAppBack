const User = require('../schemas/userSchema');
const Chat = require('../schemas/chatSchema');
const Post = require('../schemas/postSchema');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const JWT_SECRET = process.env.JWT_SECRET;

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'username userPicture')
        res.json({ success: true, users })
    } catch (error) {
        console.error('Failed to retrieve all users:', error)
        res.status(500).json({ success: false, message: 'Failed to retrieve all users' })
    }
}

exports.getUserProfile = async (req, res) => {
    const token = req.header('Authorization')

    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET)
        const username = decoded.username
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }
        const payload = {
            user: {
                id: user._id,
                username: user.username,
                userPicture: user.userPicture,
                conversations: user.conversations,
            },
        }
        res.json({ success: true, ...payload })
    } catch (error) {
        console.error(error)
        return res.status(401).json({ success: false, message: 'Invalid token' })
    }
}

exports.updateUserPicture = async (req, res) => {
    const token = req.header('Authorization')
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
    }
    jwt.verify(token.split(' ')[1], JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Invalid token' })
        }
        const username = decoded.username
        const newPictureUrl = req.body.newPictureUrl
        try {
            const user = await User.findOne({ username })
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' })
            }
            user.userPicture = newPictureUrl
            await user.save()
            await updateProfileInConversations(username, newPictureUrl)
            await updateProfileInPosts(username, newPictureUrl)
            res.json({ success: true, newPictureUrl })
        } catch (error) {
            console.error(error)
            res.status(500).json({ success: false, message: 'User picture update error' })
        }
    })
}

const updateProfileInConversations = async (username, newPictureUrl) => {
    try {
        const conversations = await Chat.find({
            'users.name': username
        })
        for (const conversation of conversations) {
            for (const user of conversation.users) {
                if (user.name === username) {
                    user.userPicture = newPictureUrl
                }
            }
            await conversation.save()
        }
    } catch (error) {
        console.error('Failed to update user picture in chat conversations:', error)
    }
}

const updateProfileInPosts = async (username, newPictureUrl) => {
    try {
        const posts = await Post.find({ 'creator.name': username })
        for (const post of posts) {
            post.creator.picture = newPictureUrl
            await post.save()
        }
    } catch (error) {
        console.error('Failed to update user picture in posts:', error)
    }
}

exports.updatePassword = async (req, res) => {
    const { username, oldPassword, newPassword } = req.body
    if (newPassword.length < 4 || newPassword.length > 20 || !/[A-Z]/.test(newPassword)) {
        return res.status(400).json({ success: false, message: 'Invalid new password' })
    }
    try {
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username' })
        }
        const passwordMatch = await bcrypt.compare(oldPassword, user.password)
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid old password' })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        const updatedUser = await User.findOneAndUpdate({ username }, { password: hashedPassword }, { new: true })
        if (!updatedUser) {
            return res.status(500).json({ success: false, message: 'Password update failed' })
        }
        res.json({ success: true, message: 'Password updated successfully' })
    } catch (error) {
        console.error('Change password error:', error)
        res.status(500).json({ success: false, message: 'Change password error' })
    }
}