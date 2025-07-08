const Product = require('../models/Product');

// src/controllers/productController.js
exports.ajouterProduit = async (req, res) => {
  try {
    const produit = new Product(req.body);
    const saved = await produit.save();
    return res.status(201).json(saved);
  } catch (err) {
    // si violation d'unicité
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Un produit avec ce nom existe déjà.' });
    }
    return res.status(400).json({ message: err.message });
  }
};



exports.getProduitParId = async (req, res) => {
  try {
    const produit = await Product.findById(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });
    res.json(produit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getProduits = async (req, res) => {
  const produits = await Product.find();
  res.json(produits);
};

exports.updateProduit = async (req, res) => {
  /*try {
    const produit = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(produit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }*/
   try {
    // Validation métier : nom unique en base
    if (req.body.nom) {
      const exists = await Product.findOne({ nom: req.body.nom });
      if (exists && exists._id.toString() !== req.params.id) {
        return res.status(409).json({ message: 'Un produit avec ce nom existe déjà.' });
      }
    }

    const produit = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!produit) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json(produit);
  } catch (err) {
    // Gestion de la violation d'index unique
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Un produit avec ce nom existe déjà.' });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProduit = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Produit supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadImage = async (req, res, next) => {
  try {
    const url = `/uploads/${req.file.filename}`;
    const produit = await Product.findByIdAndUpdate(
      req.params.id,
      { imageUrl: url },
      { new: true }
    );
    res.json(produit);
  } catch (err) {
    next(err);
  }
};
