const User = require('../schemas/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
    const {username, password} = req.body
    const existingUser = await User.findOne({username})
    if (existingUser) {
        return res.status(400).json({message: 'Username is already taken'})
    }
    const isUsernameValid = username.length >= 4 && username.length <= 20
    const isPasswordValid =
        password.length >= 4 &&
        password.length <= 20 &&
        /[A-Z]/.test(password)
    if (!isUsernameValid || !isPasswordValid) {
        return res.status(400).json({message: 'Invalid registration data'})
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const userPicture = 'https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg'
    const newUser = new User({username, password: hashedPassword, userPicture})

    try {
        await newUser.save()
        res.json({message: 'User registered successfully'})
    } catch (error) {
        console.error('Failed to register user:', error)
        res.status(500).json({message: 'Failed to register user'})
    }
}

exports.login = async (req, res) => {
    const {username, password} = req.body
    try {
        const user = await User.findOne({username})
        if (!user) {
            return res.status(401).json({success: false, message: 'Invalid username or password'})
        }
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
            return res.status(401).json({success: false, message: 'Invalid username or password'})
        }
        const token = jwt.sign({username: user.username}, JWT_SECRET, {expiresIn: '6h'})
        const payload = {
            user: {
                id: user._id,
                username: user.username,
                userPicture: user.userPicture,
                conversations: user.conversations,
            },
            token: token,
        }
        res.json({success: true, ...payload})
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({success: false, message: 'Login error'})
    }
}
