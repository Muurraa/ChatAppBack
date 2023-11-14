const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8000;

mongoose.connect(process.env.DB_KEY, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
    });

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const postRoutes = require('./routes/postRoutes')

app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/api', chatRoutes)
app.use('/api', postRoutes)

app.listen(port)

