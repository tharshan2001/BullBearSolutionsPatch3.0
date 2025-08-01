import Resource from '../models/Resource.js';

// GET /resources - Get all resources
export const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
};

// POST /resources - Create a new resource
export const createResource = async (req, res) => {
  const { title, url } = req.body;
  try {
    const newResource = new Resource({ title, url });
    await newResource.save();
    res.status(201).json(newResource);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create resource' });
  }
};


// GET /resources/:id - Get a single resource by ID
export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.status(200).json(resource);
  } catch (error) {
    res.status(400).json({ error: 'Invalid resource ID' });
  }
};

// DELETE /resources/:id - Delete a resource
export const deleteResource = async (req, res) => {
  try {
    const deleted = await Resource.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Resource not found' });
    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete resource' });
  }
};
