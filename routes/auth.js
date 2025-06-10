const {
  loginHandler,
  registerHandler,
  getAllUsersHandler,
} = require('../controllers/authController');

const authRoutes = [
  {
    method: 'POST',
    path: '/login',
    handler: loginHandler,
  },
  {
    method: 'POST',
    path: '/register',
    handler: registerHandler,
  },
  {
    method: 'GET',
    path: '/users',
    handler: getAllUsersHandler,
  }
];

module.exports = authRoutes;
