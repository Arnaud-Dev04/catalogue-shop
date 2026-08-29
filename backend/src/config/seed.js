import bcrypt from 'bcryptjs';
import db from '../config/db.js';

async function seed() {
  try {
    console.log('🌱 Insertion des données de démonstration...');

    // 1. Compte Admin
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2024';
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await db.execute({ sql: `INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')`, args: ['Administrateur', 'admin@catalogue.com', passwordHash] });
    console.log('  ✔ Compte admin créé (email: admin@catalogue.com)');

    // 2. Paramètres boutique
    const existingSettings = await db.execute({ sql: 'SELECT id FROM settings LIMIT 1', args: [] });
    if (existingSettings.rows.length === 0) {
      await db.execute({ sql: `INSERT INTO settings (business_name, whatsapp_number, email, phone, address, currency) VALUES (?, ?, ?, ?, ?, ?)`, args: ['Clopofeco', '25712345678', 'contact@clopofeco.com', '+257 12 345 678', 'Bujumbura, Burundi', 'BIF'] });
      console.log('  ✔ Paramètres de la boutique insérés.');
    }

    // 3. Catégories
    const categories = [
      { name: 'Chaussures',    slug: 'chaussures',  description: 'Chaussures pour homme, femme et enfant.',          image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
      { name: 'Vêtements',     slug: 'vetements',   description: 'Vêtements tendance pour toute la famille.',         image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80' },
      { name: 'Accessoires',   slug: 'accessoires', description: 'Sacs, ceintures et autres accessoires de mode.',    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80' },
      { name: 'Électronique',  slug: 'electronique',description: 'Téléphones, écouteurs et gadgets électroniques.',  image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80' },
      { name: 'Maison & Déco', slug: 'maison-deco', description: 'Objets décoratifs et articles pour la maison.',    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80' },
    ];
    const categoryIds = {};
    for (const cat of categories) {
      await db.execute({ sql: `INSERT OR IGNORE INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)`, args: [cat.name, cat.slug, cat.description, cat.image_url] });
      const r = await db.execute({ sql: 'SELECT id FROM categories WHERE slug = ?', args: [cat.slug] });
      categoryIds[cat.slug] = r.rows[0].id;
    }
    console.log('  ✔ 5 catégories créées.');

    // 4. Produits
    const products = [
      { category: 'chaussures',  name: 'Chaussure Premium Sport',  slug: 'chaussure-premium-sport',  description: 'Chaussure de sport haute qualité, légère et confortable.',                              price: 85000,  stock: 15, is_featured: 1, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
      { category: 'chaussures',  name: 'Mocassin Cuir Classique',   slug: 'mocassin-cuir-classique',   description: 'Mocassin en cuir véritable, finition artisanale.',                                    price: 120000, stock: 8,  is_featured: 0, image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80' },
      { category: 'vetements',   name: 'T-shirt Premium Coton',     slug: 'tshirt-premium-coton',      description: 'T-shirt en coton 100% biologique, coupe moderne.',                                    price: 18000,  stock: 45, is_featured: 1, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80' },
      { category: 'vetements',   name: 'Veste Légère Printemps',    slug: 'veste-legere-printemps',    description: 'Veste légère idéale pour les saisons intermédiaires.',                               price: 65000,  stock: 12, is_featured: 0, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80' },
      { category: 'vetements',   name: 'Pantalon Chino Slim',       slug: 'pantalon-chino-slim',       description: 'Pantalon chino coupe slim, tissu stretch pour plus de confort.',                    price: 42000,  stock: 0,  is_featured: 0, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80' },
      { category: 'accessoires', name: 'Sac à Main Élégant',        slug: 'sac-a-main-elegant',        description: 'Sac à main en cuir synthétique de qualité.',                                        price: 55000,  stock: 20, is_featured: 1, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' },
      { category: 'accessoires', name: 'Ceinture Cuir Homme',       slug: 'ceinture-cuir-homme',       description: 'Ceinture en cuir véritable avec boucle en métal doré.',                            price: 22000,  stock: 30, is_featured: 0, image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&q=80' },
      { category: 'electronique',name: 'Écouteurs Bluetooth Pro',   slug: 'ecouteurs-bluetooth-pro',   description: 'Écouteurs sans fil avec réduction de bruit active. Autonomie 24h.',                 price: 95000,  stock: 7,  is_featured: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80' },
      { category: 'electronique',name: 'Chargeur USB-C Rapide',     slug: 'chargeur-usb-c-rapide',     description: 'Chargeur 65W compatible avec la majorité des appareils modernes.',                  price: 28000,  stock: 50, is_featured: 0, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80' },
      { category: 'maison-deco', name: 'Lampe de Bureau LED',       slug: 'lampe-bureau-led',          description: "Lampe de bureau LED à intensité réglable. Design moderne.",                         price: 38000,  stock: 18, is_featured: 0, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80' },
    ];

    for (const product of products) {
      const catId = categoryIds[product.category];
      await db.execute({ sql: `INSERT OR IGNORE INTO products (category_id, name, slug, description, price, stock, is_active, is_featured) VALUES (?, ?, ?, ?, ?, ?, 1, ?)`, args: [catId, product.name, product.slug, product.description, product.price, product.stock, product.is_featured] });
      const r = await db.execute({ sql: 'SELECT id FROM products WHERE slug = ?', args: [product.slug] });
      const productId = r.rows[0].id;
      await db.execute({ sql: `INSERT OR IGNORE INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, 1)`, args: [productId, product.image] });
    }
    console.log('  ✔ 10 produits créés avec leurs images.');

    console.log('\n✅ Seed terminé avec succès !');
    console.log('   Email    : admin@catalogue.com');
    console.log('   Mot de passe : (ADMIN_PASSWORD ou "Admin@2024")');
  } catch (err) {
    console.error('❌ Erreur lors du seed :', err.message);
    process.exit(1);
  }
  process.exit(0);
}

seed();


