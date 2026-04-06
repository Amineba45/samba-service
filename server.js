'use strict';

require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`Samba Service Backend running on port ${PORT}`);
});
