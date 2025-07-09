
const { validationErrorResponse } = require('../utils/responseHandler');

/**
 * Validation middleware using Joi schemas
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Property to validate (body, params, query)
 */
const validationMiddleware = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false, // Include all errors
        allowUnknown: false, // Disallow unknown keys
        stripUnknown: true // Remove unknown keys
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context.value
        }));

        return validationErrorResponse(res, errors, 'Validation failed');
      }

      // Replace the original data with validated data
      req[property] = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Custom validation middleware for multiple properties
 * @param {Object} schemas - Object containing schemas for different properties
 */
const multiValidationMiddleware = (schemas) => {
  return (req, res, next) => {
    try {
      const errors = [];
      const validatedData = {};

      Object.keys(schemas).forEach(property => {
        const { error, value } = schemas[property].validate(req[property], {
          abortEarly: false,
          allowUnknown: false,
          stripUnknown: true
        });

        if (error) {
          const propertyErrors = error.details.map(detail => ({
            field: `${property}.${detail.path.join('.')}`,
            message: detail.message,
            value: detail.context.value
          }));
          errors.push(...propertyErrors);
        } else {
          validatedData[property] = value;
        }
      });

      if (errors.length > 0) {
        return validationErrorResponse(res, errors, 'Validation failed');
      }

      // Replace original data with validated data
      Object.keys(validatedData).forEach(property => {
        req[property] = validatedData[property];
      });

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * MongoDB ObjectId validation middleware
 * @param {String} paramName - Parameter name to validate
 */
const objectIdValidation = (paramName = 'id') => {
  return (req, res, next) => {
    const mongoose = require('mongoose');
    const id = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return validationErrorResponse(res, [{
        field: paramName,
        message: 'Invalid ObjectId format',
        value: id
      }], 'Invalid ID format');
    }

    next();
  };
};

module.exports = {
  validationMiddleware,
  multiValidationMiddleware,
  objectIdValidation
};
