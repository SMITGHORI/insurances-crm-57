
const Joi = require('joi');

// Performance metrics validation schema
const performanceMetricsSchema = Joi.object({
  period: Joi.string()
    .valid('7d', '30d', '90d')
    .optional()
    .default('30d')
    .messages({
      'any.only': 'Period must be one of: 7d, 30d, 90d'
    })
});

// Charts data validation schema
const chartsDataSchema = Joi.object({
  type: Joi.string()
    .valid('all', 'revenue', 'leads', 'claims')
    .optional()
    .default('all')
    .messages({
      'any.only': 'Chart type must be one of: all, revenue, leads, claims'
    })
});

// Recent activities validation schema
const recentActivitiesSchema = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
});

module.exports = {
  performanceMetricsSchema,
  chartsDataSchema,
  recentActivitiesSchema
};
