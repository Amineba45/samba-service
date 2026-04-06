'use strict';

const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Samba Service API',
      version: '1.0.0',
      description: 'Production-ready REST API for the Samba Service e-commerce platform',
      contact: {
        name: 'Samba Service',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
