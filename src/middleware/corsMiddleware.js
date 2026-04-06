'use strict';

const cors = require('cors');

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

module.exports = cors(corsOptions);
