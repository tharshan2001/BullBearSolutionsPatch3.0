import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const announcementSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
    default: null,
  },
  header: {
    type: Boolean,
    default: false,
  },
  headerColor: {
    type: String,
    default: '#000000',
  },
  link: {
    type: [String],
    default: [],
  },
  files: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

const Announcement = model('Announcement', announcementSchema);

export default Announcement;
