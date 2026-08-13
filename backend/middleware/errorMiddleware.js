// middleware/errorMiddleware.js
// Centralized error handling for the application.

const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // 🔴 Always log the complete error in Render logs
  console.error('========================================');
  console.error('🔥 BACKEND ERROR');
  console.error('Method:', req.method);
  console.error('URL:', req.originalUrl);
  console.error('Message:', err.message);
  console.error('Name:', err.name);
  console.error('Code:', err.code);

  if (err.stack) {
    console.error('Stack:', err.stack);
  }

  console.error('========================================');

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;

    const field = Object.keys(err.keyValue || {})[0];

    message = field
      ? `Duplicate value for field: ${field}`
      : 'Duplicate value already exists';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;

    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack:
      process.env.NODE_ENV === 'production'
        ? undefined
        : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};