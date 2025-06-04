
/**
 * Standard success response format
 */
const successResponse = (res, data = {}, statusCode = 200) => {
  const response = {
    success: true,
    timestamp: new Date().toISOString(),
    ...data
  };

  return res.status(statusCode).json(response);
};

/**
 * Standard error response format
 */
const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Paginated response format
 */
const paginatedResponse = (res, data, pagination, statusCode = 200) => {
  const response = {
    success: true,
    data,
    pagination: {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      itemsPerPage: pagination.itemsPerPage,
      hasNextPage: pagination.currentPage < pagination.totalPages,
      hasPrevPage: pagination.currentPage > 1
    },
    timestamp: new Date().toISOString()
  };

  return res.status(statusCode).json(response);
};

/**
 * Created resource response format
 */
const createdResponse = (res, data, message = 'Resource created successfully') => {
  return successResponse(res, { message, data }, 201);
};

/**
 * Updated resource response format
 */
const updatedResponse = (res, data, message = 'Resource updated successfully') => {
  return successResponse(res, { message, data }, 200);
};

/**
 * Deleted resource response format
 */
const deletedResponse = (res, message = 'Resource deleted successfully') => {
  return successResponse(res, { message }, 200);
};

/**
 * No content response format
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
  noContentResponse
};
