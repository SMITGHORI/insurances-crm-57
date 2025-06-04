
const { AppError } = require('../utils/errorHandler');

/**
 * Joi validation middleware
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Property to validate (body, query, params)
 * @returns {Function} Middleware function
 */
const validationMiddleware = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false, // Show all validation errors
        allowUnknown: false, // Don't allow unknown fields
        stripUnknown: true // Remove unknown fields
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/"/g, ''),
          value: detail.context.value
        }));

        throw new AppError('Validation failed', 400, true, errors);
      }

      // Replace request property with validated and sanitized value
      req[property] = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Custom validation middleware for complex validations
 */
const customValidationMiddleware = (validationFunction) => {
  return async (req, res, next) => {
    try {
      const result = await validationFunction(req);
      
      if (!result.isValid) {
        throw new AppError(result.message || 'Validation failed', 400, true, result.errors);
      }
      
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Sanitize input middleware
 */
const sanitizeInput = (req, res, next) => {
  // Remove potentially dangerous characters
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/[<>]/g, '');
    }
    
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  
  next();
};

module.exports = {
  validationMiddleware,
  customValidationMiddleware,
  sanitizeInput
};
