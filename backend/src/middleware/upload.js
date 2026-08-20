import multer from 'multer';

// On utilise le stockage en mémoire (MemoryStorage) car l'image
// sera envoyée directement sous forme de flux (stream) à Cloudinary.
// Cela évite d'écrire des fichiers temporaires sur le disque du serveur,
// ce qui est idéal pour les déploiements serverless comme Vercel.
const storage = multer.memoryStorage();

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite à 5 MB
  },
  fileFilter: (req, file, cb) => {
    // N'accepter que les images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Le fichier doit être une image.'));
    }
  }
});
