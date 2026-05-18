import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Lead from '../models/Lead';
import { AuthRequest, AppError } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

// POST /api/leads
export const createLead = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    if (!req.user) throw new AppError('Not authenticated', 401);

    const { name, email, status, source } = req.body;

    const lead = await Lead.create({
      name,
      email,
      status: status || 'new',
      source,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead,
    });
  }
);

// GET /api/leads
export const getLeads = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    if (!req.user) throw new AppError('Not authenticated', 401);

    const {
      status,
      source,
      search,
      sortBy = 'latest',
      page = '1',
      limit = '10',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { userId: req.user.id };

    if (status) query.status = status;
    if (source) query.source = source;

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }

    const sortOrder = sortBy === 'oldest' ? 1 : -1;

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Lead.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: 'Leads retrieved',
      data: leads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  }
);

// GET /api/leads/:id
export const getLead = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    if (!req.user) throw new AppError('Not authenticated', 401);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new AppError('Invalid lead ID', 400);
    }

    const lead = await Lead.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!lead) throw new AppError('Lead not found', 404);

    res.status(200).json({
      success: true,
      message: 'Lead retrieved',
      data: lead,
    });
  }
);

// PUT /api/leads/:id
export const updateLead = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    if (!req.user) throw new AppError('Not authenticated', 401);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new AppError('Invalid lead ID', 400);
    }

    const { name, email, status, source } = req.body;

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, email, status, source },
      { new: true, runValidators: true }
    );

    if (!lead) throw new AppError('Lead not found', 404);

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: lead,
    });
  }
);

// DELETE /api/leads/:id
export const deleteLead = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    if (!req.user) throw new AppError('Not authenticated', 401);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new AppError('Invalid lead ID', 400);
    }

    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!lead) throw new AppError('Lead not found', 404);

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
      data: null,
    });
  }
);

// GET /api/leads/export/csv
export const exportLeadsCSV = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    if (!req.user) throw new AppError('Not authenticated', 401);

    const { status, source, search } = req.query as Record<string, string>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { userId: req.user.id };
    if (status) query.status = status;
    if (source) query.source = source;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 }).lean();

    // Generate CSV content
    const headers = ['Name', 'Email', 'Status', 'Source', 'Created At'];
    const rows = leads.map((lead) => [
      `"${lead.name.replace(/"/g, '""')}"`,
      `"${lead.email}"`,
      `"${lead.status}"`,
      `"${lead.source}"`,
      `"${new Date(lead.createdAt).toISOString().split('T')[0]}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const filename = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  }
);

// GET /api/leads/stats/dashboard
export const getDashboardStats = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    if (!req.user) throw new AppError('Not authenticated', 401);

    const userId = new mongoose.Types.ObjectId(req.user.id);

    const [totalLeads, byStatus] = await Promise.all([
      Lead.countDocuments({ userId }),
      Lead.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved',
      data: {
        totalLeads,
        byStatus,
      },
    });
  }
);
