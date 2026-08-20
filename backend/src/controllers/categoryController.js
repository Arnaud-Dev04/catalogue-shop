import pool from '../config/db.js';

function toSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ── GET /api/categories ─────────────────────────────────────────
export async function getCategories(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*,
              COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = TRUE
       WHERE c.is_active = TRUE
       GROUP BY c.id
       ORDER BY c.name ASC`
    );
    res.json({ categories: rows });
  } catch (err) {
    console.error('Erreur getCategories :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── GET /api/categories/all (admin : inclut inactives) ──────────
export async function getAllCategories(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*,
              COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.name ASC`
    );
    res.json({ categories: rows });
  } catch (err) {
    console.error('Erreur getAllCategories :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── GET /api/categories/:id ─────────────────────────────────────
export async function getCategory(req, res) {
  try {
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);
    const condition = isNumeric ? 'c.id = ?' : 'c.slug = ?';

    const [rows] = await pool.execute(
      `SELECT c.*, COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = TRUE
       WHERE ${condition}
       GROUP BY c.id
       LIMIT 1`,
      [isNumeric ? parseInt(id) : id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Catégorie introuvable.' });
    }
    res.json({ category: rows[0] });
  } catch (err) {
    console.error('Erreur getCategory :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── POST /api/categories ────────────────────────────────────────
export async function createCategory(req, res) {
  const { name, description, image_url, is_active } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Le nom de la catégorie est requis.' });
  }

  try {
    const slug = toSlug(name);
    const [result] = await pool.execute(
      `INSERT INTO categories (name, slug, description, image_url, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), slug, description || null, image_url || null, is_active !== false]
    );

    const [newCat] = await pool.execute('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Catégorie créée.', category: newCat[0] });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Une catégorie avec ce nom existe déjà.' });
    }
    console.error('Erreur createCategory :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── PUT /api/categories/:id ─────────────────────────────────────
export async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, description, image_url, is_active } = req.body;

  try {
    const [existing] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Catégorie introuvable.' });
    }

    const current = existing[0];
    const newSlug = name ? toSlug(name) : current.slug;

    await pool.execute(
      `UPDATE categories
       SET name = ?, slug = ?, description = ?, image_url = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        name        ?? current.name,
        newSlug,
        description ?? current.description,
        image_url   ?? current.image_url,
        is_active   !== undefined ? is_active : current.is_active,
        id,
      ]
    );

    const [updated] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Catégorie mise à jour.', category: updated[0] });
  } catch (err) {
    console.error('Erreur updateCategory :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// ── DELETE /api/categories/:id ──────────────────────────────────
export async function deleteCategory(req, res) {
  const { id } = req.params;
  try {
    const [existing] = await pool.execute('SELECT id FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Catégorie introuvable.' });
    }

    // Détache les produits liés à cette catégorie (SET NULL via FK)
    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Catégorie supprimée avec succès.' });
  } catch (err) {
    console.error('Erreur deleteCategory :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
