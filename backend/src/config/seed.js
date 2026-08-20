import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

// ============================================================
// SCRIPT DE SEED : Données de démonstration
// Exécuter avec : node src/config/seed.js
// ============================================================

async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log('🌱 Insertion des données de démonstration...');

    // ── 1. Compte Administrateur ─────────────────────────────
    // Le mot de passe réel est défini via la variable d'environnement ADMIN_PASSWORD
    // En développement, le mot de passe par défaut est : Admin@2024
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2024';
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await conn.execute(
      `INSERT IGNORE INTO users (name, email, password_hash, role)
       VALUES (?, ?, ?, 'admin')`,
      ['Administrateur', 'admin@catalogue.com', passwordHash]
    );
    console.log('  ✔ Compte admin créé  (email: admin@catalogue.com)');

    // ── 2. Paramètres de la boutique ─────────────────────────
    const [existingSettings] = await conn.execute('SELECT id FROM settings LIMIT 1');
    if (existingSettings.length === 0) {
      await conn.execute(
        `INSERT INTO settings (business_name, whatsapp_number, email, phone, address, currency)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          'Mon Catalogue',
          '25712345678',
          'contact@catalogue.com',
          '+257 12 345 678',
          'Bujumbura, Burundi',
          'BIF',
        ]
      );
      console.log('  ✔ Paramètres de la boutique insérés.');
    }

    // ── 3. Catégories ─────────────────────────────────────────
    const categories = [
      {
        name: 'Chaussures',
        slug: 'chaussures',
        description: 'Chaussures pour homme, femme et enfant.',
        image_url: 'https://picsum.photos/seed/shoes/400/300',
      },
      {
        name: 'Vêtements',
        slug: 'vetements',
        description: 'Vêtements tendance pour toute la famille.',
        image_url: 'https://picsum.photos/seed/clothes/400/300',
      },
      {
        name: 'Accessoires',
        slug: 'accessoires',
        description: 'Sacs, ceintures et autres accessoires de mode.',
        image_url: 'https://picsum.photos/seed/bags/400/300',
      },
      {
        name: 'Électronique',
        slug: 'electronique',
        description: 'Téléphones, écouteurs et gadgets électroniques.',
        image_url: 'https://picsum.photos/seed/tech/400/300',
      },
      {
        name: 'Maison & Déco',
        slug: 'maison-deco',
        description: 'Objets décoratifs et articles pour la maison.',
        image_url: 'https://picsum.photos/seed/home/400/300',
      },
    ];

    const categoryIds = {};
    for (const cat of categories) {
      const [result] = await conn.execute(
        `INSERT IGNORE INTO categories (name, slug, description, image_url)
         VALUES (?, ?, ?, ?)`,
        [cat.name, cat.slug, cat.description, cat.image_url]
      );
      // Récupère l'id de la catégorie (existante ou nouvellement créée)
      const [rows] = await conn.execute('SELECT id FROM categories WHERE slug = ?', [cat.slug]);
      categoryIds[cat.slug] = rows[0].id;
    }
    console.log('  ✔ 5 catégories créées.');

    // ── 4. Produits ───────────────────────────────────────────
    const products = [
      {
        category: 'chaussures',
        name: 'Chaussure Premium Sport',
        slug: 'chaussure-premium-sport',
        description: 'Chaussure de sport haute qualité, légère et confortable. Idéale pour la course et les activités en plein air.',
        price: 85000,
        stock: 15,
        is_featured: true,
        image: 'https://picsum.photos/seed/sport-shoe/600/450',
      },
      {
        category: 'chaussures',
        name: 'Mocassin Cuir Classique',
        slug: 'mocassin-cuir-classique',
        description: 'Mocassin en cuir véritable, finition artisanale. Parfait pour les occasions formelles.',
        price: 120000,
        stock: 8,
        is_featured: false,
        image: 'https://picsum.photos/seed/mocassin/600/450',
      },
      {
        category: 'vetements',
        name: 'T-shirt Premium Coton',
        slug: 'tshirt-premium-coton',
        description: 'T-shirt en coton 100% biologique, coupe moderne et confortable pour tous les jours.',
        price: 18000,
        stock: 45,
        is_featured: true,
        image: 'https://picsum.photos/seed/tshirt/600/450',
      },
      {
        category: 'vetements',
        name: 'Veste Légère Printemps',
        slug: 'veste-legere-printemps',
        description: 'Veste légère idéale pour les saisons intermédiaires. Style casual et moderne.',
        price: 65000,
        stock: 12,
        is_featured: false,
        image: 'https://picsum.photos/seed/jacket/600/450',
      },
      {
        category: 'vetements',
        name: 'Pantalon Chino Slim',
        slug: 'pantalon-chino-slim',
        description: 'Pantalon chino coupe slim, tissu stretch pour plus de confort. Disponible en plusieurs coloris.',
        price: 42000,
        stock: 0,
        is_featured: false,
        image: 'https://picsum.photos/seed/pants/600/450',
      },
      {
        category: 'accessoires',
        name: 'Sac à Main Élégant',
        slug: 'sac-a-main-elegant',
        description: 'Sac à main en cuir synthétique de qualité. Grande capacité avec plusieurs compartiments.',
        price: 55000,
        stock: 20,
        is_featured: true,
        image: 'https://picsum.photos/seed/handbag/600/450',
      },
      {
        category: 'accessoires',
        name: 'Ceinture Cuir Homme',
        slug: 'ceinture-cuir-homme',
        description: 'Ceinture en cuir véritable avec boucle en métal doré. Taille ajustable.',
        price: 22000,
        stock: 30,
        is_featured: false,
        image: 'https://picsum.photos/seed/belt/600/450',
      },
      {
        category: 'electronique',
        name: 'Écouteurs Bluetooth Pro',
        slug: 'ecouteurs-bluetooth-pro',
        description: 'Écouteurs sans fil avec réduction de bruit active. Autonomie 24h, charge rapide en 15 min.',
        price: 95000,
        stock: 7,
        is_featured: true,
        image: 'https://picsum.photos/seed/earphones/600/450',
      },
      {
        category: 'electronique',
        name: 'Chargeur USB-C Rapide',
        slug: 'chargeur-usb-c-rapide',
        description: 'Chargeur 65W compatible avec la majorité des appareils modernes. Compact et puissant.',
        price: 28000,
        stock: 50,
        is_featured: false,
        image: 'https://picsum.photos/seed/charger/600/450',
      },
      {
        category: 'maison-deco',
        name: 'Lampe de Bureau LED',
        slug: 'lampe-bureau-led',
        description: "Lampe de bureau LED à intensité réglable. Design moderne, économie d'énergie maximale.",
        price: 38000,
        stock: 18,
        is_featured: false,
        image: 'https://picsum.photos/seed/lamp/600/450',
      },
    ];

    for (const product of products) {
      const catId = categoryIds[product.category];
      const [result] = await conn.execute(
        `INSERT IGNORE INTO products
          (category_id, name, slug, description, price, stock, is_active, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, TRUE, ?)`,
        [catId, product.name, product.slug, product.description, product.price, product.stock, product.is_featured]
      );

      // Récupère l'id du produit
      const [rows] = await conn.execute('SELECT id FROM products WHERE slug = ?', [product.slug]);
      const productId = rows[0].id;

      // Insère l'image principale du produit
      await conn.execute(
        `INSERT IGNORE INTO product_images (product_id, image_url, is_primary)
         VALUES (?, ?, TRUE)`,
        [productId, product.image]
      );
    }
    console.log('  ✔ 10 produits créés avec leurs images.');

    console.log('\n✅ Seed terminé avec succès !');
    console.log('\n📋 Informations de connexion admin :');
    console.log('   Email    : admin@catalogue.com');
    console.log('   Mot de passe : (valeur de ADMIN_PASSWORD ou "Admin@2024" par défaut)');
    console.log('\n⚠️  Changez le mot de passe en production via la variable ADMIN_PASSWORD !');
  } catch (err) {
    console.error('❌ Erreur lors du seed :', err.message);
    process.exit(1);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();
