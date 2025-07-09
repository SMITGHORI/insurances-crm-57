
/**
 * Success Response Handler
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    status: 'success',
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Error Response Handler
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code
 * @param {Object} error - Error details (optional)
 */
const errorResponse = (res, message = 'Something went wrong', statusCode = 500, error = null) => {
  const response = {
    success: false,
    status: 'error',
    message,
    timestamp: new Date().toISOString()
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

/**
 * Validation Error Response Handler
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 * @param {String} message - Error message
 */
const validationErrorResponse = (res, errors, message = 'Validation failed') => {
  return res.status(400).json({
    success: false,
    status: 'fail',
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

/**
 * Paginated Response Handler
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {Object} pagination - Pagination info
 * @param {String} message - Success message
 */
const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    status: 'success',
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  paginatedResponse
};
