const Joi = require("joi");

const loginValidation = (req, res, next) => {
  const userValidationSchema = Joi.object({
    email: Joi.string().min(5).max(30).required().messages({
      "string.base": "Username must be a string",
      "string.empty": "Username is required",
      "string.min": "Username must be at least 6 characters",
      "any.required": "Username is required",
    }),
    password: Joi.string().min(6).max(128).required().messages({
      "string.base": "Password must be a string",
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
      "any.required": "Password is required",
    }),
  });

  // Validate the request body
  const { error } = userValidationSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: errorMessages });
  }

  // If validation passes, move to next middleware
  next();
};

module.exports = loginValidation;
