const express = require('express');
const router = express.Router();
const pool = require('../db');

// Add an item to the cart
router.post('/:userId/items', async (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  try {
    // Ensure cart exists for user
    let cart = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
    if (cart.rows.length === 0) {
      cart = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [userId]);
    } else {
      cart = cart.rows[0];
    }

    const result = await pool.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [cart.id, productId, quantity]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get items in the cart
router.get('/:userId/items', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT cart_items.*, products.name, products.description, products.price FROM cart_items JOIN carts ON cart_items.cart_id = carts.id JOIN products ON cart_items.product_id = products.id WHERE carts.user_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Remove an item from the cart
router.delete('/:userId/items/:itemId', async (req, res) => {
  const { userId, itemId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND cart_id IN (SELECT id FROM carts WHERE user_id = $2) RETURNING *',
      [itemId, userId]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('Item not found in cart');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Clear the cart
router.delete('/:userId/items', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = $1) RETURNING *',
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
