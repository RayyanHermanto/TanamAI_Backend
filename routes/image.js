const { predictImageHandler } = require('../controllers/imageController');

const imageRoutes = [
  {
    method: 'POST',
    path: '/poststories',
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 20 * 1024 * 1024,
        allow: 'multipart/form-data',
      },
      handler: predictImageHandler,
    }
  },
  {
    method: 'GET',
    path: '/getmystories',
    handler: require('../controllers/imageController').getPredictionsByTokenHandler
  }  
];

module.exports = imageRoutes;
