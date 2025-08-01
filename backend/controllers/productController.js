import Product from '../models/Product.js';
import slugify from 'slugify';


// export const createProduct = async (req, res) => {
//   try {
//     let imagePath = null;

//     if (req.file) {
//       // Multer uploaded file path (relative to frontend)
//       imagePath = `/uploads/${req.file.filename}`;
//     } else if (req.body.imageUrl) {
//       // Image URL provided by client
//       imagePath = req.body.imageUrl;
//     } else {
//       return res.status(400).json({ error: 'Image file or URL is required' });
//     }

//     // Parse tags into array
//     let tagsArray = [];
//     if (req.body.tags) {
//       if (Array.isArray(req.body.tags)) {
//         tagsArray = req.body.tags;
//       } else {
//         try {
//           tagsArray = JSON.parse(req.body.tags);
//           if (!Array.isArray(tagsArray)) {
//             tagsArray = [];
//           }
//         } catch {
//           // If JSON parse fails, split by comma
//           tagsArray = req.body.tags.split(',').map(t => t.trim()).filter(t => t);
//         }
//       }
//     }

//     const newProduct = new Product({
//       Title: req.body.Title,
//       Price: req.body.Price,
//       description: req.body.description,
//       image: imagePath,
//       category: req.body.category,
//       tags: tagsArray,
//       discount: req.body.discount ?? 0,
//       sellingCount: req.body.sellingCount,  
//       isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true,
//       isHidden: req.body.isHidden !== undefined ? req.body.isHidden : false,
//     });

//     const saved = await newProduct.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     console.error('Create Product Error:', err);
//     res.status(400).json({ error: err.message || 'Failed to create product' });
//   }
// };



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
      slug, // save slug here
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



export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    // Emit socket event that products were fetched (optional)
    const io = req.app.get('io');
    io.emit('productsFetched', {
      count: products.length,
      products
    });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get all visible products (exclude hidden)
export const getVisibleProducts = async (req, res) => {
  try {
    const products = await Product.find({ isHidden: false });

    // Emit socket event when visible products are fetched (optional)
    const io = req.app.get('io');
    io.emit('visibleProductsFetched', {
      count: products.length,
      products
    });

    res.status(200).json(products);
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


// Update product by ID with socket emission
export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Product not found' });

    // Emit socket event to notify all clients about the updated product
    const io = req.app.get('io');
    io.emit('productUpdated', updated);

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete product by ID with socket emission
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });

    // Emit socket event to notify all clients that a product was deleted
    const io = req.app.get('io');
    io.emit('productDeleted', { productId: deleted._id });

    res.status(200).json({ message: 'Product deleted successfully' });
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

    // Emit socket event
    const io = req.app.get('io');
    io.emit('productVisibilityChanged', {
      productId: product._id,
      isHidden: product.isHidden
    });

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

