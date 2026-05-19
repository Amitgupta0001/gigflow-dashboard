import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest, AppError, UserPayload } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const generateToken = (payload: UserPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError('JWT_SECRET not configured', 500);
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

// POST /api/auth/register
export const register = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    const { name, email, password, adminSecret, phone, title, company } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email is already registered', 409);
    }

    // Determine role — only grant admin if correct secret is provided
    let role: 'admin' | 'sales_user' = 'sales_user';
    if (adminSecret && adminSecret === process.env.ADMIN_SECRET) {
      role = 'admin';
    }

    const user = await User.create({ name, email, password, role, phone, title, company });

    const payload: UserPayload = {
      id: (user._id as unknown as string).toString(),
      email: user.email,
      role: user.role,
    };
    const token = generateToken(payload);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          title: user.title,
          company: user.company,
          avatar: user.avatar,
        },
      },
    });
  }
);

// POST /api/auth/login
export const login = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const payload: UserPayload = {
      id: (user._id as unknown as string).toString(),
      email: user.email,
      role: user.role,
    };
    const token = generateToken(payload);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          title: user.title,
          company: user.company,
          avatar: user.avatar,
        },
      },
    });
  }
);

// GET /api/auth/me
export const getCurrentUser = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    if (!req.user) throw new AppError('Not authenticated', 401);

    const user = await User.findById(req.user.id);
    if (!user) throw new AppError('User not found', 404);

    res.status(200).json({
      success: true,
      message: 'User retrieved',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          title: user.title,
          company: user.company,
          avatar: user.avatar,
        },
      },
    });
  }
);

// PUT /api/auth/profile
export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    if (!req.user) throw new AppError('Not authenticated', 401);

    const { name, email, phone, title, company, avatar, password } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) throw new AppError('User not found', 404);

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        throw new AppError('Email is already registered', 409);
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (title !== undefined) user.title = title;
    if (company !== undefined) user.company = company;
    if (avatar !== undefined) user.avatar = avatar;

    if (password) {
      user.password = password; // pre-save hook hashes this
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          title: user.title,
          company: user.company,
          avatar: user.avatar,
        },
      },
    });
  }
);
