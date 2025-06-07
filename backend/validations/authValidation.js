
const Joi = require('joi');

// Refresh session validation schema
const refreshSessionSchema = Joi.object({
  // No body parameters needed for refresh
});

module.exports = {
  refreshSessionSchema
};
