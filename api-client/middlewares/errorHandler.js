// middlewares/errorHandler.js

const errorHandler = (err, req, res, next) => {
    console.error('❌ Erreur :', err.stack);
  
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  
    res.status(statusCode).json({
      message: err.message || 'Erreur serveur',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  };
  
  module.exports = errorHandler;
  