import pool from '../config/db.js';

// ── POST /api/orders ────────────────────────────────────────────
export async function createOrder(req, res) {
  const { customer_name, customer_phone, customer_email, items } = req.body;

  if (!customer_name || !customer_phone || !customer_email) {
    return res.status(400).json({ error: 'Nom, téléphone et email du client sont requis.' });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'La commande doit contenir au moins un produit.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Calcule le total depuis la base (prix réels, pas ceux du client)
    let total = 0;
    const enrichedItems = [];

    for (const item of items) {
      const [rows] = await conn.execute(
        'SELECT id, name, price, stock FROM products WHERE id = ? AND is_active = TRUE',
        [item.product_id]
      );
      if (rows.length === 0) {
        throw new Error(`Produit ID ${item.product_id} introuvable ou inactif.`);
      }
      const product = rows[0];
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuffisant pour "${product.name}" (dispo : ${product.stock}).`);
      }

      const subtotal = parseFloat(product.price) * parseInt(item.quantity);
      total += subtotal;
      enrichedItems.push({ ...item, unit_price: product.price, subtotal });
    }

    // Crée la commande
    const [orderResult] = await conn.execute(
      `INSERT INTO orders (customer_name, customer_phone, customer_email, total, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [customer_name, customer_phone, customer_email, total]
    );
    const orderId = orderResult.insertId;

    // Insère les articles
    for (const item of enrichedItems) {
      await conn.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.unit_price, item.subtotal]
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'Commande enregistrée avec succès.', order_id: orderId, total });
  } catch (err) {
    await conn.rollback();
    console.error('Erreur createOrder :', err);
    res.status(400).json({ error: err.message || 'Erreur lors de la création de la commande.' });
  } finally {
    conn.release();
  }
}

// ── GET /api/orders ─────────────────────────────────────────────
export async function getOrders(req, res) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = '';
    const params = [];
    if (status) {
      where = 'WHERE o.status = ?';
      params.push(status);
    }

    const [rows] = await pool.execute(
      `SELECT o.*, COUNT(oi.id) AS items_count
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       ${where}
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM orders o ${where}`,
      params
    );

    res.json({
      orders: rows,
      pagination: {
        total: countRows[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countRows[0].total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Erreur getOrders :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── GET /api/orders/:id ─────────────────────────────────────────
export async function getOrder(req, res) {
  try {
    const { id } = req.params;

    const [orders] = await pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Commande introuvable.' });
    }

    const [items] = await pool.execute(
      `SELECT oi.*, p.name AS product_name, p.slug AS product_slug,
              pi.image_url AS product_image
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       LEFT JOIN product_images pi ON pi.product_id = oi.product_id AND pi.is_primary = TRUE
       WHERE oi.order_id = ?`,
      [id]
    );

    res.json({ order: { ...orders[0], items } });
  } catch (err) {
    console.error('Erreur getOrder :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── PUT /api/orders/:id ─────────────────────────────────────────
export async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Statut invalide. Valeurs acceptées : ${validStatuses.join(', ')}` });
  }

  try {
    const [existing] = await pool.execute('SELECT id FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Commande introuvable.' });
    }

    await pool.execute(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    res.json({ message: 'Statut de la commande mis à jour.', status });
  } catch (err) {
    console.error('Erreur updateOrderStatus :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
