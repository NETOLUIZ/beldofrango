const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const TIPOS_PERMITIDOS = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

/**
 * Fábrica de multer diskStorage — evita repetição de config entre produtos e banners.
 * O nome do arquivo é sempre aleatório (hex) para não expor o nome original
 * nem permitir sobrescrever arquivos por adivinhação.
 * @param {string} subdir - subdiretório dentro de uploads/ (ex: 'produtos', 'banners')
 */
function criarStorage(subdir) {
  return multer.diskStorage({
    destination: path.join(__dirname, '..', '..', 'uploads', subdir),
    filename(req, file, cb) {
      const extensao = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `${crypto.randomBytes(16).toString('hex')}${extensao}`);
    },
  });
}

/** Multer configurado para fotos de produto — salva em uploads/produtos. */
const uploadFoto = multer({
  storage: criarStorage('produtos'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter(req, file, cb) {
    if (!TIPOS_PERMITIDOS.has(file.mimetype)) {
      return cb(new Error('Tipo de arquivo não permitido — envie JPG, PNG, WEBP ou GIF'));
    }
    cb(null, true);
  },
});

/** Multer configurado para fotos de banner — salva em uploads/banners. */
const uploadFotoBanner = multer({
  storage: criarStorage('banners'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter(req, file, cb) {
    if (!TIPOS_PERMITIDOS.has(file.mimetype)) {
      return cb(new Error('Tipo de arquivo não permitido — envie JPG, PNG, WEBP ou GIF'));
    }
    cb(null, true);
  },
});

/** Multer configurado para fotos de categoria — salva em uploads/categorias. */
const uploadFotoCategoria = multer({
  storage: criarStorage('categorias'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter(req, file, cb) {
    if (!TIPOS_PERMITIDOS.has(file.mimetype)) {
      return cb(new Error('Tipo de arquivo não permitido — envie JPG, PNG, WEBP ou GIF'));
    }
    cb(null, true);
  },
});

module.exports = { uploadFoto, uploadFotoBanner, uploadFotoCategoria };
