const Joi = require('joi');

// Password validation schema - requires complexity
const passwordSchema = Joi.string()
  .min(8)
  .max(100)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/)
  .required()
  .messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&)',
    'string.min': 'Password must be at least 8 characters',
    'string.max': 'Password must not exceed 100 characters',
    'any.required': 'Password is required',
  });

// Signup validation
exports.signupSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'any.required': 'Email is required',
    }),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{9,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid phone number format',
      'any.required': 'Phone is required',
    }),
  aadhaar: Joi.string()
    .pattern(/^[2-9]\d{11}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid Aadhaar number (12 digits)',
      'any.required': 'Aadhaar is required',
    }),
  password: passwordSchema,
  role: Joi.string()
    .valid('PATIENT', 'DOCTOR', 'PHARMACIST')
    .required()
    .messages({
      'any.only': 'Role must be PATIENT, DOCTOR, or PHARMACIST',
    }),
});

// Login validation
exports.loginSchema = Joi.object({
  identifier: Joi.string()
    .required()
    .messages({
      'any.required': 'Email or phone is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

// Prescription validation
exports.prescriptionSchema = Joi.object({
  patientMedTrackId: Joi.string()
    .required()
    .messages({
      'any.required': 'Patient MedTrack ID is required',
    }),
  visitReason: Joi.string()
    .max(500)
    .optional(),
  diagnosis: Joi.string()
    .max(500)
    .optional(),
  notes: Joi.string()
    .max(1000)
    .optional(),
  medicines: Joi.object({
    names: Joi.array().items(Joi.string().max(100)).optional(),
    dosages: Joi.array().items(Joi.string().max(50)).optional(),
    frequencies: Joi.array().items(Joi.string().max(50)).optional(),
    routes: Joi.array().items(Joi.string().max(50)).optional(),
    durationDays: Joi.array().items(Joi.number().positive()).optional(),
    instructions: Joi.array().items(Joi.string().max(200)).optional(),
  }).optional(),
  issueDate: Joi.date().optional(),
  attachmentUrl: Joi.string().uri().optional(),
}).unknown(false);

// Validation middleware
exports.validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      details,
    });
  }

  req.body = value;
  next();
};
