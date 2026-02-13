const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  res.json({
    sistema: {
      nome: 'Chamados TI',
      versao: '1.0.0'
    },
    email: {
      smtp_host: process.env.SMTP_HOST,
      smtp_port: process.env.SMTP_PORT
    },
    geral: {
      timezone: process.env.TIMEZONE,
      multiempresa: process.env.MULTIEMPRESA === 'true'
    }
  });
});

module.exports = router;
