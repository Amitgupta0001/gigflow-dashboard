import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.type === 'field' ? e.path : e.type,
        message: e.msg,
      })),
    });
    return;
  }
  next();
};

export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim(),
  body('title').optional().trim(),
  body('company').optional().trim(),
  handleValidationErrors,
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

export const validateLead = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Lead name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'won', 'lost'])
    .withMessage('Status must be one of: new, contacted, qualified, won, lost'),
  body('source')
    .isIn(['website', 'instagram', 'referral'])
    .withMessage('Source must be one of: website, instagram, referral'),
  body('company').optional().trim().isString(),
  body('value').optional().isNumeric().withMessage('Value must be a number'),
  body('phone').optional().trim().isString(),
  body('title').optional().trim().isString(),
  body('starred').optional().isBoolean(),
  body('pinned').optional().isBoolean(),
  body('nextAction').optional().trim().isString(),
  body('lastContactedAt').optional().isISO8601(),
  body('timeline').optional().isArray(),
  body('attachments').optional().isArray(),
  handleValidationErrors,
];
