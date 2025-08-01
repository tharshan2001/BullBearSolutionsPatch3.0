import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const updateSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  important: {
    type: Boolean,
    default: false,
  },
  links: [{
    type: String,
  }],
  images: [{
    url: { type: String, required: true },
    altText: { type: String, default: '' },
  }],
  documents: [{
    url: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['pdf', 'doc', 'docx'], required: true },
  }]
}, {
  timestamps: true,
});

const Update = model('Update', updateSchema);

export default Update;
