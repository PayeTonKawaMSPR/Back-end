/*const multer = require('multer');
const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
module.exports = multer({ storage });*/

const multer = require('multer');
const path  = require('path');

const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname)
});

function fileFilter(req, file, cb) {
  // Récupère l’extension en minuscule
  const ext = path.extname(file.originalname).toLowerCase();
  // Liste des extensions autorisées
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];

  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images (jpg, png, webp) sont autorisées'), false);
  }
}

module.exports = multer({ storage, fileFilter });

