import mongoose, { Document, Schema } from 'mongoose';

// Block interface for page builder components
interface IBlock {
  id: string;
  type: string;
  props: Record<string, any>;
  position: {
    row: number;
    col: number;
    span?: number;
  };
  visibility?: {
    desktop?: boolean;
    tablet?: boolean;
    mobile?: boolean;
  };
}

// Page interface
export interface IPage extends Document {
  title: string;
  slug: string;
  meta: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  settings: {
    layout?: 'full-width' | 'contained';
    theme?: 'default' | 'dark';
    customCSS?: string;
  };
  navigation: {
    showInNavigation: boolean;
    navigationTitle?: string;
    menuOrder: number;
    parentSlug?: string;
  };
  blocks: IBlock[];
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: Date;
  scheduledAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Block schema
const blockSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  props: { type: Schema.Types.Mixed, default: {} },
  position: {
    row: { type: Number, required: true },
    col: { type: Number, required: true },
    span: { type: Number, default: 12 }
  },
  visibility: {
    desktop: { type: Boolean, default: true },
    tablet: { type: Boolean, default: true },
    mobile: { type: Boolean, default: true }
  }
}, { _id: false });

// Page schema
const pageSchema = new Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/
  },
  meta: {
    title: { type: String, maxlength: 60 },
    description: { type: String, maxlength: 160 },
    keywords: [{ type: String }],
    ogImage: { type: String }
  },
  settings: {
    layout: { 
      type: String, 
      enum: ['full-width', 'contained'], 
      default: 'contained' 
    },
    theme: { 
      type: String, 
      enum: ['default', 'dark'], 
      default: 'default' 
    },
    customCSS: { type: String }
  },
  navigation: {
    showInNavigation: { type: Boolean, default: false },
    navigationTitle: { type: String, trim: true, maxlength: 100 },
    menuOrder: { type: Number, default: 0 },
    parentSlug: { type: String, trim: true }
  },
  blocks: [blockSchema],
  status: { 
    type: String, 
    enum: ['draft', 'published', 'scheduled'], 
    default: 'draft' 
  },
  publishedAt: { type: Date },
  scheduledAt: { type: Date },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  updatedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
// Note: slug index is automatically created by unique: true
pageSchema.index({ status: 1, publishedAt: -1 });
pageSchema.index({ createdBy: 1 });
pageSchema.index({ updatedAt: -1 });
pageSchema.index({ 'navigation.showInNavigation': 1, status: 1, 'navigation.menuOrder': 1 });

// Pre-save middleware to generate slug if not provided
pageSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }
  next();
});

const Page = mongoose.model<IPage>('Page', pageSchema);

export default Page;