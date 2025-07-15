// seeder.js (version simplifiée)
const mongoose = require('mongoose');
const Product = require('./src/models/Product');const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:example@mongo:27017/gestionProduits?authSource=admin';
const seedDataPath = path.join(__dirname, 'data', 'produits.json');

async function seedDB() {
  try {
    // Attendre 5 secondes que MongoDB soit prêt
    console.log("⏳ Attente de 5s que MongoDB soit prêt...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const data = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));
    const existing = await Product.countDocuments();
    
    if (existing > 0) {
      console.log('📦 Produits déjà présents. Pas de seed nécessaire.');
    } else {
      await Product.insertMany(data);
      console.log('✅ Produits insérés avec succès');
    }
  } catch (err) {
    console.error('❌ Erreur seed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seedDB();