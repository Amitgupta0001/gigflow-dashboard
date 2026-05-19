import mongoose, { Document, Schema, Model } from 'mongoose';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
export type LeadSource = 'website' | 'instagram' | 'referral';

export interface ITimelineItem {
  type: 'creation' | 'call' | 'email' | 'note' | 'stage_change' | 'other';
  text: string;
  createdAt: Date;
}

export interface IAttachmentItem {
  name: string;
  size: number; // in bytes
  url: string;
}

export interface ILead extends Document {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  company: string;
  value: number;
  phone: string;
  title: string;
  starred: boolean;
  pinned: boolean;
  nextAction: string;
  lastContactedAt: Date;
  timeline: ITimelineItem[];
  attachments: IAttachmentItem[];
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Lead email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'contacted', 'qualified', 'won', 'lost'],
        message: 'Status must be one of: new, contacted, qualified, won, lost',
      },
      default: 'new',
    },
    source: {
      type: String,
      required: [true, 'Lead source is required'],
      enum: {
        values: ['website', 'instagram', 'referral'],
        message: 'Source must be one of: website, instagram, referral',
      },
    },
    company: {
      type: String,
      default: '',
      trim: true,
    },
    value: {
      type: Number,
      default: 0,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    starred: {
      type: Boolean,
      default: false,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    nextAction: {
      type: String,
      default: '',
      trim: true,
    },
    lastContactedAt: {
      type: Date,
      default: Date.now,
    },
    timeline: [
      {
        type: {
          type: String,
          enum: ['creation', 'call', 'email', 'note', 'stage_change', 'other'],
          required: true,
        },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    attachments: [
      {
        name: { type: String, required: true },
        size: { type: Number, required: true },
        url: { type: String, required: true },
      },
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient filtered queries
leadSchema.index({ userId: 1, status: 1, source: 1 });

// Text search index for name and email
leadSchema.index({ name: 'text', email: 'text' });

const Lead: Model<ILead> = mongoose.model<ILead>('Lead', leadSchema);
export default Lead;
