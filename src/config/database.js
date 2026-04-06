const mongoose = require('mongoose');

const mongoURI = 'mongodb://<username>:<password>@localhost:27017/samba_service'; // Replace <username> and <password> with actual credentials

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;