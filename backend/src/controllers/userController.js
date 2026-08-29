import bcrypt from 'bcryptjs';
import db from '../config/db.js';

// GET /api/users
export async function getUsers(req, res) {
  try {
    const result = await db.execute({ 
      sql: 'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC', 
      args: [] 
    });
    res.json({ users: result.rows });
  } catch (err) {
    console.error('Erreur getUsers :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// POST /api/users
export async function createUser(req, res) {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nom, email et mot de passe requis.' });
  }
  
  const userRole = role === 'superadmin' ? 'superadmin' : 'admin';

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const ins = await db.execute({ 
      sql: `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`, 
      args: [name, email, passwordHash, userRole] 
    });
    
    const newUser = await db.execute({ 
      sql: 'SELECT id, name, email, role, created_at FROM users WHERE id = ?', 
      args: [Number(ins.lastInsertRowid)] 
    });
    
    res.status(201).json({ message: 'Utilisateur créé.', user: newUser.rows[0] });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }
    console.error('Erreur createUser :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// PUT /api/users/:id
export async function updateUser(req, res) {
  const { id } = req.params;
  const { name, email, password, role } = req.body;
  
  try {
    const ex = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [id] });
    if (ex.rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    const cur = ex.rows[0];

    const updatedRole = role === 'superadmin' || role === 'admin' ? role : cur.role;
    let newPasswordHash = cur.password_hash;

    if (password && password.trim() !== '') {
      newPasswordHash = await bcrypt.hash(password, 12);
    }

    await db.execute({ 
      sql: `UPDATE users SET name=?, email=?, password_hash=?, role=?, updated_at=datetime('now') WHERE id=?`, 
      args: [name ?? cur.name, email ?? cur.email, newPasswordHash, updatedRole, id] 
    });

    const updated = await db.execute({ 
      sql: 'SELECT id, name, email, role, created_at FROM users WHERE id = ?', 
      args: [id] 
    });
    
    res.json({ message: 'Utilisateur mis à jour.', user: updated.rows[0] });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé par un autre compte.' });
    }
    console.error('Erreur updateUser :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}

// DELETE /api/users/:id
export async function deleteUser(req, res) {
  const { id } = req.params;
  
  // Interdire la suppression de soi-même
  if (parseInt(id) === req.user.id) {
    return res.status(403).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' });
  }

  try {
    const ex = await db.execute({ sql: 'SELECT id FROM users WHERE id = ?', args: [id] });
    if (ex.rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    
    await db.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [id] });
    res.json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (err) {
    console.error('Erreur deleteUser :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}
