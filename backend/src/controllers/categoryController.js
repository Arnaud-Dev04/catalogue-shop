import db from '../config/db.js';

function toSlug(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
}

// GET /api/categories
export async function getCategories(req, res) {
  try {
    const result = await db.execute({ sql: `SELECT c.*, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1 WHERE c.is_active = 1 GROUP BY c.id ORDER BY c.name ASC`, args: [] });
    res.json({ categories: result.rows });
  } catch (err) { console.error('Erreur getCategories :', err); res.status(500).json({ error: 'Erreur serveur.' }); }
}

// GET /api/categories/all (admin)
export async function getAllCategories(req, res) {
  try {
    const result = await db.execute({ sql: `SELECT c.*, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON p.category_id = c.id GROUP BY c.id ORDER BY c.name ASC`, args: [] });
    res.json({ categories: result.rows });
  } catch (err) { console.error('Erreur getAllCategories :', err); res.status(500).json({ error: 'Erreur serveur.' }); }
}

// GET /api/categories/:id
export async function getCategory(req, res) {
  try {
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);
    const result = await db.execute({ sql: `SELECT c.*, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1 WHERE ${isNumeric ? 'c.id = ?' : 'c.slug = ?'} GROUP BY c.id LIMIT 1`, args: [isNumeric ? parseInt(id) : id] });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Categorie introuvable.' });
    res.json({ category: result.rows[0] });
  } catch (err) { console.error('Erreur getCategory :', err); res.status(500).json({ error: 'Erreur serveur.' }); }
}

// POST /api/categories
export async function createCategory(req, res) {
  const { name, description, image_url, is_active } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Le nom de la categorie est requis.' });
  try {
    const slug = toSlug(name);
    const ins = await db.execute({ sql: `INSERT INTO categories (name, slug, description, image_url, is_active) VALUES (?, ?, ?, ?, ?)`, args: [name.trim(), slug, description || null, image_url || null, is_active !== false ? 1 : 0] });
    const newCat = await db.execute({ sql: 'SELECT * FROM categories WHERE id = ?', args: [Number(ins.lastInsertRowid)] });
    res.status(201).json({ message: 'Categorie creee.', category: newCat.rows[0] });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Une categorie avec ce nom existe deja.' });
    console.error('Erreur createCategory :', err); res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// PUT /api/categories/:id
export async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, description, image_url, is_active } = req.body;
  try {
    const ex = await db.execute({ sql: 'SELECT * FROM categories WHERE id = ?', args: [id] });
    if (ex.rows.length === 0) return res.status(404).json({ error: 'Categorie introuvable.' });
    const cur = ex.rows[0];
    const newSlug = name ? toSlug(name) : cur.slug;
    await db.execute({ sql: `UPDATE categories SET name=?, slug=?, description=?, image_url=?, is_active=?, updated_at=datetime('now') WHERE id=?`, args: [name ?? cur.name, newSlug, description ?? cur.description, image_url ?? cur.image_url, is_active !== undefined ? (is_active ? 1 : 0) : cur.is_active, id] });
    const updated = await db.execute({ sql: 'SELECT * FROM categories WHERE id = ?', args: [id] });
    res.json({ message: 'Categorie mise a jour.', category: updated.rows[0] });
  } catch (err) { console.error('Erreur updateCategory :', err); res.status(500).json({ error: 'Erreur serveur.' }); }
}

// DELETE /api/categories/:id
export async function deleteCategory(req, res) {
  const { id } = req.params;
  try {
    const ex = await db.execute({ sql: 'SELECT id FROM categories WHERE id = ?', args: [id] });
    if (ex.rows.length === 0) return res.status(404).json({ error: 'Categorie introuvable.' });
    await db.execute({ sql: 'DELETE FROM categories WHERE id = ?', args: [id] });
    res.json({ message: 'Categorie supprimee avec succes.' });
  } catch (err) { console.error('Erreur deleteCategory :', err); res.status(500).json({ error: 'Erreur serveur.' }); }
}
