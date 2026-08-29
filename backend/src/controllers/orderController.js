import db from '../config/db.js';

// POST /api/orders
export async function createOrder(req, res) {
  const { customer_name, customer_phone, customer_email, items } = req.body;
  if (!customer_name || !customer_phone || !customer_email)
    return res.status(400).json({ error: 'Nom, telephone et email du client sont requis.' });
  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: 'La commande doit contenir au moins un produit.' });
  try {
    let total = 0;
    const enrichedItems = [];
    for (const item of items) {
      const r = await db.execute({ sql: 'SELECT id, name, price, stock FROM products WHERE id = ? AND is_active = 1', args: [item.product_id] });
      if (r.rows.length === 0) throw new Error(`Produit ID ${item.product_id} introuvable ou inactif.`);
      const product = r.rows[0];
      if (product.stock < item.quantity) throw new Error(`Stock insuffisant pour "${product.name}" (dispo : ${product.stock}).`);
      const subtotal = parseFloat(product.price) * parseInt(item.quantity);
      total += subtotal;
      enrichedItems.push({ ...item, unit_price: product.price, subtotal });
    }
    const orderResult = await db.execute({ sql: `INSERT INTO orders (customer_name, customer_phone, customer_email, total, status) VALUES (?, ?, ?, ?, 'pending')`, args: [customer_name, customer_phone, customer_email, total] });
    const orderId = Number(orderResult.lastInsertRowid);
    for (const item of enrichedItems) {
      await db.execute({ sql: `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)`, args: [orderId, item.product_id, item.quantity, item.unit_price, item.subtotal] });
    }
    res.status(201).json({ message: 'Commande enregistree avec succes.', order_id: orderId, total });
  } catch (err) { console.error('Erreur createOrder :', err); res.status(400).json({ error: err.message || 'Erreur lors de la creation de la commande.' }); }
}

// GET /api/orders
export async function getOrders(req, res) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = ''; const args = [];
    if (status) { where = 'WHERE o.status = ?'; args.push(status); }
    const result = await db.execute({ sql: `SELECT o.*, COUNT(oi.id) AS items_count FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id ${where} GROUP BY o.id ORDER BY o.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`, args });
    const countResult = await db.execute({ sql: `SELECT COUNT(*) AS total FROM orders o ${where}`, args });
    res.json({ orders: result.rows, pagination: { total: Number(countResult.rows[0].total), page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(Number(countResult.rows[0].total) / parseInt(limit)) } });
  } catch (err) { console.error('Erreur getOrders :', err); res.status(500).json({ error: 'Erreur serveur.' }); }
}

// GET /api/orders/:id
export async function getOrder(req, res) {
  try {
    const { id } = req.params;
    const orders = await db.execute({ sql: 'SELECT * FROM orders WHERE id = ?', args: [id] });
    if (orders.rows.length === 0) return res.status(404).json({ error: 'Commande introuvable.' });
    const items = await db.execute({ sql: `SELECT oi.*, p.name AS product_name, p.slug AS product_slug, pi.image_url AS product_image FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id LEFT JOIN product_images pi ON pi.product_id = oi.product_id AND pi.is_primary = 1 WHERE oi.order_id = ?`, args: [id] });
    res.json({ order: { ...orders.rows[0], items: items.rows } });
  } catch (err) { console.error('Erreur getOrder :', err); res.status(500).json({ error: 'Erreur serveur.' }); }
}

// PUT /api/orders/:id
export async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!status || !validStatuses.includes(status))
    return res.status(400).json({ error: `Statut invalide. Valeurs acceptees : ${validStatuses.join(', ')}` });
  try {
    const existing = await db.execute({ sql: 'SELECT id FROM orders WHERE id = ?', args: [id] });
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Commande introuvable.' });
    await db.execute({ sql: `UPDATE orders SET status=?, updated_at=datetime('now') WHERE id=?`, args: [status, id] });
    res.json({ message: 'Statut de la commande mis a jour.', status });
  } catch (err) { console.error('Erreur updateOrderStatus :', err); res.status(500).json({ error: 'Erreur serveur.' }); }
}
