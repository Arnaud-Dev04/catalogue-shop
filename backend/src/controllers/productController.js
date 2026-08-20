import pool from '../config/db.js';

// Génère un slug à partir d'un texte
function toSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // retire les accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ── GET /api/products ───────────────────────────────────────────
// Supports : ?search=, ?category=, ?sort=price_asc|price_desc|newest, ?available=true, ?page=, ?limit=
export async function getProducts(req, res) {
  try {
    const { search, category, sort, available, page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = ['p.is_active = TRUE'];
    const params = [];

    if (search) {
      where.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      where.push('c.slug = ?');
      params.push(category);
    }
    if (available === 'true') {
      where.push('p.stock > 0');
    }

    let orderBy = 'p.created_at DESC';
    if (sort === 'price_asc')  orderBy = 'p.price ASC';
    if (sort === 'price_desc') orderBy = 'p.price DESC';
    if (sort === 'newest')     orderBy = 'p.created_at DESC';

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // Requête principale
    const [rows] = await pool.execute(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug,
              pi.image_url AS primary_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ${parseInt(limit)} OFFSET ${offset}`,
      params
    );

    // Compte total pour la pagination
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}`,
      params
    );

    res.json({
      products: rows,
      pagination: {
        total: countRows[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countRows[0].total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Erreur getProducts :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── GET /api/products/:id ───────────────────────────────────────
export async function getProduct(req, res) {
  try {
    const { id } = req.params;

    // Cherche par ID ou par slug
    const isNumeric = /^\d+$/.test(id);
    const condition = isNumeric ? 'p.id = ?' : 'p.slug = ?';

    const [rows] = await pool.execute(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ${condition}
       LIMIT 1`,
      [isNumeric ? parseInt(id) : id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Produit introuvable.' });
    }

    // Récupère toutes les images du produit
    const [images] = await pool.execute(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC',
      [rows[0].id]
    );

    res.json({ ...rows[0], images });
  } catch (err) {
    console.error('Erreur getProduct :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── POST /api/products ──────────────────────────────────────────
export async function createProduct(req, res) {
  const { name, description, category_id, price, stock, is_active, is_featured, images } = req.body;

  if (!name || !price || price <= 0 || stock < 0 || !category_id) {
    return res.status(400).json({ error: 'Nom, prix (> 0), stock (≥ 0) et catégorie sont requis.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const slug = toSlug(name);

    const [result] = await conn.execute(
      `INSERT INTO products (category_id, name, slug, description, price, stock, is_active, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id, name, slug, description || null, parseFloat(price), parseInt(stock),
       is_active !== false, is_featured || false]
    );

    const productId = result.insertId;

    // Insertion des images si fournies
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await conn.execute(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
          [productId, images[i].url, i === 0]
        );
      }
    }

    await conn.commit();

    const [newProduct] = await conn.execute(
      `SELECT p.*, c.name AS category_name FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [productId]
    );

    res.status(201).json({ message: 'Produit créé avec succès.', product: newProduct[0] });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Un produit avec ce nom existe déjà.' });
    }
    console.error('Erreur createProduct :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  } finally {
    conn.release();
  }
}

// ── PUT /api/products/:id ───────────────────────────────────────
export async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, description, category_id, price, stock, is_active, is_featured, images } = req.body;

  if (price !== undefined && price <= 0) {
    return res.status(400).json({ error: 'Le prix doit être supérieur à 0.' });
  }
  if (stock !== undefined && stock < 0) {
    return res.status(400).json({ error: 'Le stock ne peut pas être négatif.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existing] = await conn.execute('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Produit introuvable.' });
    }

    const current = existing[0];
    const newSlug = name ? toSlug(name) : current.slug;

    await conn.execute(
      `UPDATE products
       SET name = ?, slug = ?, description = ?, category_id = ?,
           price = ?, stock = ?, is_active = ?, is_featured = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        name        ?? current.name,
        newSlug,
        description ?? current.description,
        category_id ?? current.category_id,
        price       !== undefined ? parseFloat(price)  : current.price,
        stock       !== undefined ? parseInt(stock)    : current.stock,
        is_active   !== undefined ? is_active          : current.is_active,
        is_featured !== undefined ? is_featured        : current.is_featured,
        id,
      ]
    );

    // Mise à jour des images si fournies
    if (images && images.length > 0) {
      await conn.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
      for (let i = 0; i < images.length; i++) {
        await conn.execute(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
          [id, images[i].url, i === 0]
        );
      }
    }

    await conn.commit();

    const [updated] = await conn.execute(
      `SELECT p.*, c.name AS category_name FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    res.json({ message: 'Produit mis à jour.', product: updated[0] });
  } catch (err) {
    await conn.rollback();
    console.error('Erreur updateProduct :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  } finally {
    conn.release();
  }
}

// ── DELETE /api/products/:id ────────────────────────────────────
export async function deleteProduct(req, res) {
  const { id } = req.params;
  try {
    const [existing] = await pool.execute('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Produit introuvable.' });
    }

    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Produit supprimé avec succès.' });
  } catch (err) {
    console.error('Erreur deleteProduct :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── GET /api/products/featured ──────────────────────────────────
export async function getFeaturedProducts(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug,
              pi.image_url AS primary_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
       WHERE p.is_active = TRUE AND p.is_featured = TRUE
       ORDER BY p.updated_at DESC
       LIMIT 8`
    );
    res.json({ products: rows });
  } catch (err) {
    console.error('Erreur getFeaturedProducts :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
