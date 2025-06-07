
const Joi = require('joi');

// Get notifications validation schema
const getNotificationsSchema = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .optional()
    .default(5)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 50'
    })
});

// Get messages validation schema
const getMessagesSchema = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .optional()
    .default(5)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 50'
    })
});

module.exports = {
  getNotificationsSchema,
  getMessagesSchema
};
