const { v4: uuidv4 } = require('uuid');
const Post = require('../schemas/postSchema');

function validatePostTitleLength(title) {
    return title && title.length >= 3 && title.length <= 30
}

exports.createPosts = async (req, res) => {
    const { creator, image, title } = req.body
    if (!validatePostTitleLength(title)) {
        return res.status(400).json({ success: false, message: 'Message must be between 3 and 30 characters.' })
    }
    try {
        const post = new Post({
            id: uuidv4(),
            image: image,
            title: title,
            creator: creator,
            comments: [],
            likes: [],
        })
        await post.save()
        res.status(200).json({ success: true, message: 'Post successfully created' })
    } catch (error) {
        console.error('Failed to create a post:', error)
        res.status(500).json({ success: false, message: error })
    }
}


exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
        res.status(200).json({ success: true, posts })
    } catch (error) {
        console.error('Failed to fetch posts:', error)
        res.status(500).json({ success: false, message: 'Failed to fetch posts' })
    }
}

exports.updateLikes = async (req, res) => {
    const { postId, username } = req.body
    try {
        const post = await Post.findOne({ id: postId })
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' })
        }
        const userIndex = post.likes.findIndex((like) => like.name === username)
        if (userIndex === -1) {
            post.likes.push({ name: username })
        } else {
            post.likes = post.likes.filter((like) => like.name !== username)
        }
        await post.save()
        res.status(200).json({ success: true, message: 'Likes updated successfully' })
    } catch (error) {
        console.error('Failed to update post likes:', error)
        res.status(500).json({ success: false, message: 'Failed to update post likes' })
    }
}

exports.createComment = async (req, res) => {
    const { postId, name, comment } = req.body
    try {
        const post = await Post.findOne({ id: postId })
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' })
        }
        const newComment = {
            name,
            comment,
        }
        post.comments.push(newComment)
        await post.save()
        res.status(200).json({ success: true, message: 'Comment created successfully' })
    } catch (error) {
        console.error('Failed to create a comment:', error)
        res.status(500).json({ success: false, message: 'Failed to create a comment' })
    }
}
