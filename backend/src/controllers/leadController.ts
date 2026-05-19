import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Lead from '../models/Lead';
import { AuthRequest, AppError } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

// POST /api/leads
export const createLead = asyncHandler(
  async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
    if (!req.user) throw new AppError('Not authenticated', 401);

    const {
      name,
      email,
      status,
      source,
      company,
      value,
      phone,
      title,
      starred,
      pinned,
      nextAction,
      lastContactedAt,
      timeline,
      attachments,
    } = req.body;

    const defaultTimeline = timeline || [
      { type: 'creation', text: 'Deal created', createdAt: new Date() },
    ];

    const lead = await Lead.create({
      name,
      email,
      status: status || 'new',
      source,
      company: company || '',
      value: value || 0,
      phone: phone || '',
      title: title || '',
      starred: starred || false,
      pinned: pinned || false,
      nextAction: nextAction || '',
      lastContactedAt: lastContactedAt || new Date(),
      timeline: defaultTimeline,
      attachments: attachments || [],
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
      minPrice,
      maxPrice,
      stuckDays,
      starred,
      pinned,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    // Support large limit (e.g. 1000) for Kanban board fetching
    const limitNum = limit === 'all' ? 10000 : Math.min(1000, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { userId: req.user.id };

    if (status) {
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }
    if (source) query.source = source;
    if (starred === 'true') query.starred = true;
    if (pinned === 'true') query.pinned = true;

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { email: regex }, { company: regex }];
    }

    if (minPrice || maxPrice) {
      query.value = {};
      if (minPrice) query.value.$gte = parseFloat(minPrice);
      if (maxPrice) query.value.$lte = parseFloat(maxPrice);
    }

    if (stuckDays) {
      const days = parseInt(stuckDays);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      // Stuck in the current stage implies updatedAt (or lastContactedAt) is older than cutoffDate
      query.lastContactedAt = { $lte: cutoffDate };
    }

    const sortOrder = sortBy === 'oldest' ? 1 : -1;

    // Custom sorting: pinned leads should appear first in their columns
    // We can fetch, then do sorting, or sort by { pinned: -1, createdAt: sortOrder }
    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort({ pinned: -1, createdAt: sortOrder })
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

    const lead = await Lead.findOne({ _id: req.params.id, userId: req.user.id });
    if (!lead) throw new AppError('Lead not found', 404);

    const {
      name,
      email,
      status,
      source,
      company,
      value,
      phone,
      title,
      starred,
      pinned,
      nextAction,
      lastContactedAt,
      timeline,
      attachments,
    } = req.body;

    if (name !== undefined) lead.name = name;
    if (email !== undefined) lead.email = email;
    if (status !== undefined) {
      if (status !== lead.status) {
        lead.timeline.push({
          type: 'stage_change',
          text: `Stage changed from ${lead.status.toUpperCase()} to ${status.toUpperCase()}`,
          createdAt: new Date(),
        });
      }
      lead.status = status;
    }
    if (source !== undefined) lead.source = source;
    if (company !== undefined) lead.company = company;
    if (value !== undefined) lead.value = Number(value);
    if (phone !== undefined) lead.phone = phone;
    if (title !== undefined) lead.title = title;
    if (starred !== undefined) lead.starred = starred;
    if (pinned !== undefined) lead.pinned = pinned;
    if (nextAction !== undefined) lead.nextAction = nextAction;
    if (lastContactedAt !== undefined) lead.lastContactedAt = new Date(lastContactedAt);
    if (timeline !== undefined) lead.timeline = timeline;
    if (attachments !== undefined) lead.attachments = attachments;

    await lead.save();

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
      query.$or = [{ name: regex }, { email: regex }, { company: regex }];
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 }).lean();

    // Generate CSV content
    const headers = [
      'Company',
      'Name',
      'Title',
      'Email',
      'Phone',
      'Value',
      'Status',
      'Source',
      'Next Action',
      'Created At',
    ];
    const rows = leads.map((lead) => [
      `"${(lead.company || '').replace(/"/g, '""')}"`,
      `"${lead.name.replace(/"/g, '""')}"`,
      `"${(lead.title || '').replace(/"/g, '""')}"`,
      `"${lead.email}"`,
      `"${lead.phone || ''}"`,
      lead.value || 0,
      `"${lead.status}"`,
      `"${lead.source}"`,
      `"${(lead.nextAction || '').replace(/"/g, '""')}"`,
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

    const [totalLeads, byStatus, valueSumResult, wonCount, lostCount, closingThisWeekCount] =
      await Promise.all([
        Lead.countDocuments({ userId }),
        Lead.aggregate([
          { $match: { userId } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Lead.aggregate([
          { $match: { userId } },
          { $group: { _id: null, total: { $sum: '$value' } } },
        ]),
        Lead.countDocuments({ userId, status: 'won' }),
        Lead.countDocuments({ userId, status: 'lost' }),
        // Deals closing this week: qualified or won deals updated in the last 7 days
        Lead.countDocuments({
          userId,
          status: { $in: ['qualified', 'won'] },
          updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }),
      ]);

    const totalValue = valueSumResult[0]?.total || 0;
    const activeCount = await Lead.countDocuments({
      userId,
      status: { $in: ['new', 'contacted', 'qualified'] },
    });

    const totalClosed = wonCount + lostCount;
    const winRate = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 0;

    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved',
      data: {
        totalLeads,
        byStatus,
        totalValue,
        activeCount,
        winRate,
        closingThisWeek: closingThisWeekCount,
      },
    });
  }
);
