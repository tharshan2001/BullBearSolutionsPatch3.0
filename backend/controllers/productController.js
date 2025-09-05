import Product from '../models/Product.js';
import slugify from 'slugify';

// Create a new product
export const createProduct = async (req, res) => {
  try {
    let imagePath = null;

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imagePath = req.body.imageUrl;
    } else {
      return res.status(400).json({ error: 'Image file or URL is required' });
    }

    // Parse tags into array
    let tagsArray = [];
    if (req.body.tags) {
      if (Array.isArray(req.body.tags)) {
        tagsArray = req.body.tags;
      } else {
        try {
          tagsArray = JSON.parse(req.body.tags);
          if (!Array.isArray(tagsArray)) {
            tagsArray = [];
          }
        } catch {
          tagsArray = req.body.tags.split(',').map(t => t.trim()).filter(t => t);
        }
      }
    }

    // Generate slug from Title
    const slug = slugify(req.body.Title, { lower: true, strict: true });

    const newProduct = new Product({
      Title: req.body.Title,
      slug,
      Price: req.body.Price,
      description: req.body.description,
      image: imagePath,
      category: req.body.category,
      tags: tagsArray,
      discount: req.body.discount ?? 0,
      sellingCount: req.body.sellingCount,
      isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true,
      isHidden: req.body.isHidden !== undefined ? req.body.isHidden : false,
    });

    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Create Product Error:', err);
    res.status(400).json({ error: err.message || 'Failed to create product' });
  }
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all visible products
export const getVisibleProducts = async (req, res) => {
  try {
    const products = await Product.find({ isHidden: false });
    res.status(200).json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get product by slug
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update product by ID
export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Product not found' });

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete product by ID
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });

    res.status(200).json({ message: 'Product deleted successfully', productId: deleted._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle isHidden for a product
export const toggleProductVisibility = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    product.isHidden = !product.isHidden;
    await product.save();

    res.status(200).json({ productId: product._id, isHidden: product.isHidden });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
