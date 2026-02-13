const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Diretório base para uploads
const uploadDir = path.join(__dirname, '../../uploads');

// Criar diretórios se não existirem
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Subdiretório baseado no tipo de entidade
    const entityType = req.params.entityType || 'chamados';
    const entityId = req.params.id || 'temp';
    
    const destPath = path.join(uploadDir, entityType, entityId);
    
    // Criar diretório se não existe
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    // Gerar nome único: timestamp_nomeoriginal
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E5);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniquePrefix + '-' + sanitizedName);
  }
});

// Filtro de tipos de arquivo permitidos
const fileFilter = (req, file, cb) => {
  // Tipos permitidos
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`), false);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE || 10 * 1024 * 1024) // Default 10MB
  }
});

module.exports = {
  upload,
  uploadDir
};
