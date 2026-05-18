import mongoose, { Document, Schema, Model } from 'mongoose';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost';
export type LeadSource = 'website' | 'instagram' | 'referral';

export interface ILead extends Document {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
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
        values: ['new', 'contacted', 'qualified', 'lost'],
        message: 'Status must be one of: new, contacted, qualified, lost',
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
