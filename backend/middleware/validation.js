
const validationMiddleware = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errorMessages = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages
        });
      }

      req.body = value;
      next();
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Validation error'
      });
    }
  };
};

module.exports = validationMiddleware;
