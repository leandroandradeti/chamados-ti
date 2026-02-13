const express = require('express');
const router = express.Router();
const { Chamado, User, ChamadoStatus } = require('../../models');

// Dashboard - estatísticas principais
router.get('/dashboard', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.roles?.some(role => role.nivel <= 2);

    // Chamados por status
    const whereClause = isAdmin ? {} : { solicitante_id: userId };
    
    const [
      totalChamados,
      chamadosAbertos,
      chamadosEmAndamento,
      meusChamados,
      slaVencendo
    ] = await Promise.all([
      Chamado.count({ where: whereClause }),
      Chamado.count({ 
        where: { ...whereClause },
        include: [{ 
          model: ChamadoStatus, 
          as: 'status', 
          where: { tipo: 'aberto' } 
        }]
      }),
      Chamado.count({ 
        where: { ...whereClause },
        include: [{ 
          model: ChamadoStatus, 
          as: 'status', 
          where: { tipo: 'em_andamento' } 
        }]
      }),
      Chamado.count({ where: { solicitante_id: userId } }),
      Chamado.count({ 
        where: { 
          ...whereClause,
          sla_vencido: false,
          prazo_sla: { [require('sequelize').Op.lte]: new Date(Date.now() + 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    res.json({
      totalChamados,
      chamadosAbertos,
      chamadosEmAndamento,
      meusChamados,
      slaVencendo
    });
  } catch (error) {
    next(error);
  }
});

// Meus chamados
router.get('/meus-chamados', async (req, res, next) => {
  try {
    const chamados = await Chamado.findAll({
      where: { solicitante_id: req.user.id },
      include: [
        { model: ChamadoStatus, as: 'status' },
        { model: User, as: 'tecnico_responsavel', attributes: ['id', 'nome', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    res.json(chamados);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
