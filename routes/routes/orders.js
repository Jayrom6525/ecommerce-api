const express = require('express');
const router = express.Router();
const pool = require('../db');

// Place an order
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Get cart items for the user
    const cartItems = await pool.query(
      'SELECT cart_items.*, products.price FROM cart_items JOIN carts ON cart_items.cart_id = carts.id JOIN products ON cart_items.product_id = products.id WHERE carts.user_id = $1',
      [userId]
    );

    if (cartItems.rows.length === 0) {
      return res.status(400).send('No items in cart');
    }

    // Calculate total price
    const total = cartItems.rows.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order
    const order = await pool.query(
      'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *',
      [userId, total]
    );

    // Add items to order_items table
    const orderId = order.rows[0].id;
    const orderItems = cartItems.rows.map(item => {
      return pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    });
    await Promise.all(orderItems);

    // Clear the cart
    await pool.query(
      'DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = $1)',
      [userId]
    );

    res.json(order.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all orders for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get order details
router.get('/:userId/:orderId', async (req, res) => {
  const { userId, orderId } = req.params;

  try {
    const order = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (order.rows.length === 0) {
      return res.status(404).send('Order not found');
    }

    const orderItems = await pool.query(
      'SELECT order_items.*, products.name, products.description FROM order_items JOIN products ON order_items.product_id = products.id WHERE order_items.order_id = $1',
      [orderId]
    );

    res.json({
      order: order.rows[0],
      items: orderItems.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
