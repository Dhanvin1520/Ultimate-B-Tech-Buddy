require('dotenv').config();
const mongoose = require('mongoose');
const ChatMessage = require('../models/ChatMessage');

const clearChat = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await ChatMessage.deleteMany({});
        console.log(`Deleted ${result.deletedCount} chat messages.`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error clearing chat:', error);
        process.exit(1);
    }
};

clearChat();
