const privateRoutes = require('./routes/privateRoutes');
const publicRoutes = require('./routes/publicRoutes');

const config = {
  migrate: false,
  privateRoutes,
  publicRoutes,
  port: process.env.PORT || '2017',
  resultCodes: {
    code200: 'OK',
    code201: 'Created',
    code400: 'Bad Request',
    code404: 'Not Found',
    code500: 'Internal Server Error',
  },
};

module.exports = config;
