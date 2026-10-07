const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @route GET /api/products
router.get('/', async (req, res) => {
    const products = await Product.find({});
    res.json(products);
});

// @route GET /api/products/:id
router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// @route POST /api/products
// @access Private/Admin
router.post('/', protect, admin, async (req, res) => {
    const { name, price, brand, category, description, image, countInStock } = req.body;
    const product = new Product({
        name: name || 'Sample Perfume',
        price: price || 0,
        user: req.user._id,
        image: image || 'https://images.unsplash.com/photo-1523293115678-d29062e08e60?q=80&w=600&auto=format&fit=crop',
        brand: brand || 'Sample brand',
        category: category || 'Perfume',
        countInStock: countInStock !== undefined ? countInStock : 0,
        description: description || 'Sample description'
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @route PUT /api/products/:id
// @access Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    const { name, price, description, image, brand, category, countInStock } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name !== undefined ? name : product.name;
        product.price = price !== undefined ? price : product.price;
        product.description = description !== undefined ? description : product.description;
        product.image = image !== undefined ? image : product.image;
        product.brand = brand !== undefined ? brand : product.brand;
        product.category = category !== undefined ? category : product.category;
        product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// @route DELETE /api/products/:id
// @access Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

module.exports = router;
