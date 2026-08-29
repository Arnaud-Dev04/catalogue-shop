import db from '../config/db.js';

// GET /api/settings
export async function getSettings(req, res) {
  try {
    const result = await db.execute({ sql: 'SELECT * FROM settings LIMIT 1', args: [] });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Parametres non configures.' });
    res.json({ settings: result.rows[0] });
  } catch (err) { console.error('Erreur getSettings :', err); res.status(500).json({ error: 'Erreur serveur.' }); }
}

// PUT /api/settings
export async function updateSettings(req, res) {
  const { business_name, logo_url, whatsapp_number, email, phone, address, currency } = req.body;
  if (!business_name || !whatsapp_number || !email)
    return res.status(400).json({ error: 'Nom de la boutique, numero WhatsApp et email sont requis.' });
  try {
    const existing = await db.execute({ sql: 'SELECT id FROM settings LIMIT 1', args: [] });
    if (existing.rows.length === 0) {
      await db.execute({ sql: `INSERT INTO settings (business_name, logo_url, whatsapp_number, email, phone, address, currency) VALUES (?, ?, ?, ?, ?, ?, ?)`, args: [business_name, logo_url || null, whatsapp_number, email, phone || null, address || null, currency || 'BIF'] });
    } else {
      await db.execute({ sql: `UPDATE settings SET business_name=?, logo_url=?, whatsapp_number=?, email=?, phone=?, address=?, currency=?, updated_at=datetime('now') WHERE id=?`, args: [business_name, logo_url || null, whatsapp_number, email, phone || null, address || null, currency || 'BIF', existing.rows[0].id] });
    }
    const updated = await db.execute({ sql: 'SELECT * FROM settings LIMIT 1', args: [] });
    res.json({ message: 'Parametres mis a jour.', settings: updated.rows[0] });
  } catch (err) { console.error('Erreur updateSettings :', err); res.status(500).json({ error: 'Erreur serveur.' }); }
}

// GET /api/admin/stats
export async function getDashboardStats(req, res) {
  try {
    const productStats = await db.execute({ sql: `SELECT COUNT(*) AS total_products, SUM(CASE WHEN is_active=1 THEN 1 ELSE 0 END) AS active_products, SUM(CASE WHEN stock=0 THEN 1 ELSE 0 END) AS out_of_stock, SUM(CASE WHEN stock BETWEEN 1 AND 10 THEN 1 ELSE 0 END) AS low_stock, SUM(price * stock) AS stock_value FROM products`, args: [] });
    const categoryStats = await db.execute({ sql: 'SELECT COUNT(*) AS total_categories FROM categories', args: [] });
    const orderStats = await db.execute({ sql: 'SELECT COUNT(*) AS total_orders, SUM(total) AS total_revenue FROM orders', args: [] });
    const recentProducts = await db.execute({ sql: `SELECT p.id, p.name, p.price, p.stock, p.updated_at, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.updated_at DESC LIMIT 5`, args: [] });
    res.json({ stats: { ...productStats.rows[0], ...categoryStats.rows[0], ...orderStats.rows[0] }, recent_products: recentProducts.rows });
  } catch (err) { console.error('Erreur getDashboardStats :', err); res.status(500).json({ error: 'Erreur serveur.' }); }
}
