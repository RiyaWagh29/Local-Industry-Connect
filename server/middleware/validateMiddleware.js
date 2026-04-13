import { validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log failed validations
    console.warn(`[Validation Failed] ${req.method} ${req.originalUrl}`);
    console.warn(JSON.stringify(errors.array(), null, 2));

    // Return the first error message
    return res.status(400).json({ 
      success: false, 
      message: errors.array()[0].msg,
      data: errors.array() 
    });
  }
  next();
};
