const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod: paymentMethod || 'UPIQR',
            totalPrice,
            isPaid: true,
            paidAt: Date.now(),
            status: 'Pending'
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to create order' });
    }
});

// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to fetch user orders' });
    }
});

// @route   GET /api/orders (all orders)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to fetch orders' });
    }
});

// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to fetch order details' });
    }
});

// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to update payment status' });
    }
});

// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['Pending', 'Shipped', 'Delivered'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = status;
            if (status === 'Delivered') {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message || 'Failed to update order status' });
    }
});

module.exports = router;

