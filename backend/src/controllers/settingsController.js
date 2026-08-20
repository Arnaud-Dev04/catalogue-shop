import pool from '../config/db.js';

// ── GET /api/settings ───────────────────────────────────────────
export async function getSettings(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM settings LIMIT 1');

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Paramètres non configurés.' });
    }

    res.json({ settings: rows[0] });
  } catch (err) {
    console.error('Erreur getSettings :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── PUT /api/settings ───────────────────────────────────────────
export async function updateSettings(req, res) {
  const { business_name, logo_url, whatsapp_number, email, phone, address, currency } = req.body;

  if (!business_name || !whatsapp_number || !email) {
    return res.status(400).json({ error: 'Nom de la boutique, numéro WhatsApp et email sont requis.' });
  }

  try {
    const [existing] = await pool.execute('SELECT id FROM settings LIMIT 1');

    if (existing.length === 0) {
      // Crée les paramètres s'ils n'existent pas
      await pool.execute(
        `INSERT INTO settings (business_name, logo_url, whatsapp_number, email, phone, address, currency)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [business_name, logo_url || null, whatsapp_number, email, phone || null, address || null, currency || 'BIF']
      );
    } else {
      await pool.execute(
        `UPDATE settings
         SET business_name = ?, logo_url = ?, whatsapp_number = ?,
             email = ?, phone = ?, address = ?, currency = ?, updated_at = NOW()
         WHERE id = ?`,
        [business_name, logo_url || null, whatsapp_number, email, phone || null, address || null, currency || 'BIF', existing[0].id]
      );
    }

    const [updated] = await pool.execute('SELECT * FROM settings LIMIT 1');
    res.json({ message: 'Paramètres mis à jour.', settings: updated[0] });
  } catch (err) {
    console.error('Erreur updateSettings :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── GET /api/admin/stats ────────────────────────────────────────
export async function getDashboardStats(req, res) {
  try {
    const [[productStats]] = await pool.execute(
      `SELECT
        COUNT(*) AS total_products,
        SUM(is_active = TRUE)  AS active_products,
        SUM(stock = 0)         AS out_of_stock,
        SUM(stock BETWEEN 1 AND 10) AS low_stock,
        SUM(price * stock)     AS stock_value
       FROM products`
    );

    const [[categoryStats]] = await pool.execute(
      'SELECT COUNT(*) AS total_categories FROM categories'
    );

    const [[orderStats]] = await pool.execute(
      `SELECT
        COUNT(*) AS total_orders,
        SUM(total) AS total_revenue
       FROM orders`
    );

    const [recentProducts] = await pool.execute(
      `SELECT p.id, p.name, p.price, p.stock, p.updated_at, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ORDER BY p.updated_at DESC
       LIMIT 5`
    );

    res.json({
      stats: {
        ...productStats,
        ...categoryStats,
        ...orderStats,
      },
      recent_products: recentProducts,
    });
  } catch (err) {
    console.error('Erreur getDashboardStats :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
