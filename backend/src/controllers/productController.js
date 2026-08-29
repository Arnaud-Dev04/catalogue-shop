import db from '../config/db.js';

function toSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// GET /api/products
export async function getProducts(req, res) {
  try {
    const { search, category, sort, available, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = ['p.is_active = 1'];
    const args = [];
    if (search) { where.push('(p.name LIKE ? OR p.description LIKE ?)'); args.push(`%${search}%`, `%${search}%`); }
    if (category) { where.push('c.slug = ?'); args.push(category); }
    if (available === 'true') { where.push('p.stock > 0'); }
    let orderBy = 'p.created_at DESC';
    if (sort === 'price_asc')  orderBy = 'p.price ASC';
    if (sort === 'price_desc') orderBy = 'p.price DESC';
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const result = await db.execute({ sql: `SELECT p.*, c.name AS category_name, c.slug AS category_slug, pi.image_url AS primary_image FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1 ${whereClause} ORDER BY ${orderBy} LIMIT ${parseInt(limit)} OFFSET ${offset}`, args });
    const countResult = await db.execute({ sql: `SELECT COUNT(*) AS total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`, args });
    res.json({ products: result.rows, pagination: { total: Number(countResult.rows[0].total), page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(Number(countResult.rows[0].total) / parseInt(limit)) } });
  } catch (err) { console.error('Erreur getProducts :', err); res.status(500).json({ error: 'Erreur serveur.' }); }
}

// GET /api/products/:id
export async function getProduct(req, res) {
  try {
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);
    const result = await db.execute({ sql: `SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE ${isNumeric ? 'p.id = ?' : 'p.slug = ?'} LIMIT 1`, args: [isNumeric ? parseInt(id) : id] });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Produit introuvable.' });
    const images = await db.execute({ sql: 'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC', args: [result.rows[0].id] });
    res.json({ ...result.rows[0], images: images.rows });
  } catch (err) { console.error('Erreur getProduct :', err); res.status(500).json({ error: 'Erreur serveur.' }); }
}

// POST /api/products
export async function createProduct(req, res) {
  const { name, description, category_id, price, stock, is_active, is_featured, images } = req.body;
  if (!name || !price || price <= 0 || stock < 0 || !category_id)
    return res.status(400).json({ error: 'Nom, prix (> 0), stock (>= 0) et categorie sont requis.' });
  try {
    const slug = toSlug(name);
    const ins = await db.execute({ sql: `INSERT INTO products (category_id, name, slug, description, price, stock, is_active, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, args: [category_id, name, slug, description || null, parseFloat(price), parseInt(stock), is_active !== false ? 1 : 0, is_featured ? 1 : 0] });
    const productId = Number(ins.lastInsertRowid);
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++)
        await db.execute({ sql: 'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)', args: [productId, images[i].url, i === 0 ? 1 : 0] });
    }
    const newProduct = await db.execute({ sql: `SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`, args: [productId] });
    res.status(201).json({ message: 'Produit cree avec succes.', product: newProduct.rows[0] });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Un produit avec ce nom existe deja.' });
    console.error('Erreur createProduct :', err); res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// PUT /api/products/:id
export async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, description, category_id, price, stock, is_active, is_featured, images } = req.body;
  if (price !== undefined && price <= 0) return res.status(400).json({ error: 'Le prix doit etre superieur a 0.' });
  if (stock !== undefined && stock < 0) return res.status(400).json({ error: 'Le stock ne peut pas etre negatif.' });
  try {
    const ex = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] });
    if (ex.rows.length === 0) return res.status(404).json({ error: 'Produit introuvable.' });
    const cur = ex.rows[0];
    const newSlug = name ? toSlug(name) : cur.slug;
    await db.execute({ sql: `UPDATE products SET name=?, slug=?, description=?, category_id=?, price=?, stock=?, is_active=?, is_featured=?, updated_at=datetime('now') WHERE id=?`, args: [name ?? cur.name, newSlug, description ?? cur.description, category_id ?? cur.category_id, price !== undefined ? parseFloat(price) : cur.price, stock !== undefined ? parseInt(stock) : cur.stock, is_active !== undefined ? (is_active ? 1 : 0) : cur.is_active, is_featured !== undefined ? (is_featured ? 1 : 0) : cur.is_featured, id] });
    if (images && images.length > 0) {
      await db.execute({ sql: 'DELETE FROM product_images WHERE product_id = ?', args: [id] });
      for (let i = 0; i < images.length; i++)
        await db.execute({ sql: 'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)', args: [id, images[i].url, i === 0 ? 1 : 0] });
    }
    const updated = await db.execute({ sql: `SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`, args: [id] });
    res.json({ message: 'Produit mis a jour.', product: updated.rows[0] });
  } catch (err) { console.error('Erreur updateProduct :', err); res.status(500).json({ error: 'Erreur serveur.' }); }
}

// DELETE /api/products/:id
export async function deleteProduct(req, res) {
  const { id } = req.params;
  try {
    const ex = await db.execute({ sql: 'SELECT id FROM products WHERE id = ?', args: [id] });
    if (ex.rows.length === 0) return res.status(404).json({ error: 'Produit introuvable.' });
    await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] });
    res.json({ message: 'Produit supprime avec succes.' });
  } catch (err) { console.error('Erreur deleteProduct :', err); res.status(500).json({ error: 'Erreur serveur.' }); }
}

// GET /api/products/featured
export async function getFeaturedProducts(req, res) {
  try {
    const result = await db.execute({ sql: `SELECT p.*, c.name AS category_name, c.slug AS category_slug, pi.image_url AS primary_image FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1 WHERE p.is_active = 1 AND p.is_featured = 1 ORDER BY p.updated_at DESC LIMIT 8`, args: [] });
    res.json({ products: result.rows });
  } catch (err) { console.error('Erreur getFeaturedProducts :', err); res.status(500).json({ error: 'Erreur serveur.' }); }
}
