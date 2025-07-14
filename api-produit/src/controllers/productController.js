const fs   = require('fs').promises;
const path = require('path');
const Product = require('../models/Product');
const { publish } = require('../rabbitmq'); 

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

/*exports.getProduits = async (req, res) => {
  const produits = await Product.find();
  res.json(produits);
};*/

exports.getProduits = async (req, res, next) => {
  try {
    const { page, limit, minPrice, maxPrice, search } = req.query;
    const filter = {};
    if (minPrice) filter.prix = { ...filter.prix, $gte: minPrice };
    if (maxPrice) filter.prix = { ...filter.prix, $lte: maxPrice };
    if (search)    filter.nom  = new RegExp(search, 'i');
    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).skip(skip).limit(limit)
    ]);
    res.json({ page, limit, total, data });
  } catch (err) {
    next(err);
  }
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

exports.patchProduit = async (req, res, next) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Produit non trouvé' });
    await publish('mspr.exchange', 'produit.updated', updated);
    res.json(updated);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Conflit sur le nom' });
    next(err);
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
    const fileName = req.file.filename;
    const urlPath  = `/uploads/${fileName}`;
    const produit  = await Product.findByIdAndUpdate(
      req.params.id,
      { imagePath: urlPath },
      { new: true, runValidators: true }
    );
    if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });
    // Émettre l’événement produit.imageUploaded
    await publish('mspr.exchange', 'produit.imageUploaded', { id: produit._id, imagePath: urlPath });
    res.json(produit);
  } catch (err) {
    next(err);
  }
};

exports.replaceImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Vérifier que le fichier est bien présent
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image uploadée' });
    }

    // Récupérer le produit
    const produit = await Product.findById(id);
    if (!produit) {
      // supprimer le fichier reçu car produit inexistant
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Supprimer l’ancienne image si elle existe
    if (produit.imagePath) {
      const oldPath = path.join(__dirname, '..', 'public', produit.imagePath);
      await fs.unlink(oldPath).catch(() => {});
    }

    // Mettre à jour le chemin vers la nouvelle image
    const newImageUrl = `/uploads/${req.file.filename}`;
    produit.imagePath = newImageUrl;
    await produit.save();

    // Émettre un événement RabbitMQ
    await publish('mspr.exchange', 'produit.imageReplaced', {
      id: produit._id,
      imagePath: newImageUrl
    });

    res.json(produit);
  } catch (err) {
    next(err);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const produit = await Product.findById(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });
    if (produit.imagePath) {
      const fsPath = path.join(__dirname, '..', 'public', produit.imagePath);
      await fs.unlink(fsPath).catch(() => {});
    }
    produit.imagePath = null;
    await produit.save();
    await publish('mspr.exchange', 'produit.imageDeleted', { id: produit._id });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};


