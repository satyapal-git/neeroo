/**
 * Success Response
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error Response
 */
const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Paginated Response
 */
const paginatedResponse = (res, message, data, page, limit, total) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      pageSize: parseInt(limit),
      totalItems: total,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
};

/**
 * Created Response
 */
const createdResponse = (res, message, data = null) => {
  return successResponse(res, message, data, 201);
};

/**
 * No Content Response
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
};