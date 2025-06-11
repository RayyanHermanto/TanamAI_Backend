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
];

module.exports = authRoutes;
