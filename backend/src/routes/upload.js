import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

/**
 * POST /api/upload
 * Route protégée : seul un administrateur peut uploader des images via ImgBB
 */
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier fourni.' });
  }

  try {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Clé API ImgBB manquante dans le fichier .env' });
    }

    // Convertir l'image en base64 pour ImgBB
    const base64Image = req.file.buffer.toString('base64');
    
    // Préparer les données pour l'API
    const formData = new URLSearchParams();
    formData.append('key', apiKey);
    formData.append('image', base64Image);

    // Envoi à ImgBB
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      // On retourne l'URL directe de l'image
      res.json({ url: data.data.url });
    } else {
      console.error('Erreur retournée par ImgBB:', data);
      res.status(500).json({ error: "Erreur du service d'hébergement d'images." });
    }
    
  } catch (error) {
    console.error('Erreur ImgBB:', error);
    res.status(500).json({ error: "Erreur lors de l'upload de l'image" });
  }
});

export default router;
