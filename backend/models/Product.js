import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema({
  Title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  Price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  sellingCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isHidden: {          
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate slug before saving
productSchema.pre('save', function (next) {
  if (this.isModified('Title')) {
    this.slug = slugify(this.Title, { lower: true, strict: true });
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
