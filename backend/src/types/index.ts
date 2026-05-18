import { Request } from 'express';

export interface UserPayload {
  id: string;
  email: string;
  role: 'admin' | 'sales_user';
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}
