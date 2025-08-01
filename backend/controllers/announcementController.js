import Announcement from '../models/Announcement.js';

// Create a new announcement with image and files uploads
export const createAnnouncement = async (req, res) => {
  try {
    const imageUrl = req.files['imageUrl'] ? `/uploads/${req.files['imageUrl'][0].filename}` : null;
    const files = req.files['files'] ? req.files['files'].map(file => `/uploads/${file.filename}`) : [];

    const announcementData = {
      ...req.body,
      imageUrl,
      files,
    };

    const announcement = new Announcement(announcementData);
    await announcement.save();

    res.status(201).json(announcement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all announcements
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get a single announcement by ID
export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an announcement with optional image/files upload
export const updateAnnouncement = async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const files = req.files ? req.files.map(file => `/uploads/${file.filename}`) : undefined;

    // Prepare update data, only set imageUrl/files if new files uploaded
    const updateData = {
      ...req.body,
      ...(imageUrl && { imageUrl }),
      ...(files && { files }),
    };

    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.status(200).json(announcement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get announcements paginated (8 per page, sorted by createdAt desc)
export const getAnnouncementsPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    const announcements = await Announcement.find({ isPublished: true })  
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Show announcement (set isPublished = true, publishedAt = now)
export const showAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { isPublished: true, publishedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Hide announcement (set isPublished = false, publishedAt = null)
export const hideAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { isPublished: false, publishedAt: null },
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
