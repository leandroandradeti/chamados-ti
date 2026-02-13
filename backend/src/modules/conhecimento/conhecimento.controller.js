const { 
  ConhecimentoArtigo, 
  ConhecimentoCategoria, 
  ConhecimentoComentario,
  User 
} = require('../../models');
const { Op } = require('sequelize');

// ===== CATEGORIAS =====

exports.listarCategorias = async (req, res) => {
  try {
    const categorias = await ConhecimentoCategoria.findAll({
      where: { ativo: true },
      include: [
        { 
          model: ConhecimentoCategoria, 
          as: 'subcategorias',
          where: { ativo: true },
          required: false 
        },
        {
          model: ConhecimentoArtigo,
          as: 'artigos',
          attributes: ['id'],
          where: { status: 'publicado', ativo: true },
          required: false
        }
      ],
      order: [['ordem', 'ASC']]
    });

    res.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar categorias',
      error: error.message
    });
  }
};

exports.criarCategoria = async (req, res) => {
  try {
    const { nome, descricao, pai_id, ordem } = req.body;

    const categoria = await ConhecimentoCategoria.create({
      nome,
      descricao,
      pai_id,
      ordem: ordem || 0,
      ativo: true
    });

    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso',
      data: categoria
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar categoria',
      error: error.message
    });
  }
};

exports.atualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, pai_id, ordem, ativo } = req.body;

    const categoria = await ConhecimentoCategoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    await categoria.update({ nome, descricao, pai_id, ordem, ativo });

    res.json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      data: categoria
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar categoria',
      error: error.message
    });
  }
};

exports.deletarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await ConhecimentoCategoria.findByPk(id);
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      });
    }

    await categoria.destroy();

    res.json({
      success: true,
      message: 'Categoria removida com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar categoria',
      error: error.message
    });
  }
};

// ===== ARTIGOS =====

exports.listarArtigos = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      categoria_id, 
      status = 'publicado',
      destaque 
    } = req.query;

    const offset = (page - 1) * limit;

    const where = { ativo: true };
    
    if (status) {
      where.status = status;
    }

    if (categoria_id) {
      where.categoria_id = categoria_id;
    }

    if (destaque === 'true') {
      where.destaque = true;
    }

    if (search) {
      where[Op.or] = [
        { titulo: { [Op.iLike]: `%${search}%` } },
        { resumo: { [Op.iLike]: `%${search}%` } },
        { palavras_chave: { [Op.contains]: [search] } },
        { tags: { [Op.contains]: [search] } }
      ];
    }

    const { rows: artigos, count } = await ConhecimentoArtigo.findAndCountAll({
      where,
      include: [
        { 
          model: ConhecimentoCategoria, 
          as: 'categoria',
          attributes: ['id', 'nome']
        },
        { 
          model: User, 
          as: 'autor',
          attributes: ['id', 'nome', 'email']
        }
      ],
      attributes: { 
        exclude: ['conteudo'] // Não retornar conteúdo completo na listagem
      },
      limit: parseInt(limit),
      offset,
      order: [['destaque', 'DESC'], ['visualizacoes', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: artigos,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar artigos',
      error: error.message
    });
  }
};

exports.buscarArtigos = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Busca deve ter pelo menos 3 caracteres'
      });
    }

    const artigos = await ConhecimentoArtigo.findAll({
      where: {
        ativo: true,
        status: 'publicado',
        [Op.or]: [
          { titulo: { [Op.iLike]: `%${q}%` } },
          { resumo: { [Op.iLike]: `%${q}%` } },
          { conteudo: { [Op.iLike]: `%${q}%` } },
          { palavras_chave: { [Op.contains]: [q] } },
          { tags: { [Op.contains]: [q] } }
        ]
      },
      include: [
        { 
          model: ConhecimentoCategoria, 
          as: 'categoria',
          attributes: ['id', 'nome']
        },
        { 
          model: User, 
          as: 'autor',
          attributes: ['id', 'nome']
        }
      ],
      attributes: { 
        exclude: ['conteudo']
      },
      limit: 20,
      order: [['visualizacoes', 'DESC']]
    });

    res.json({
      success: true,
      data: artigos,
      total: artigos.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar artigos',
      error: error.message
    });
  }
};

exports.obterArtigo = async (req, res) => {
  try {
    const { id } = req.params;
    const { incrementar_visualizacao = true } = req.query;

    const artigo = await ConhecimentoArtigo.findByPk(id, {
      include: [
        { 
          model: ConhecimentoCategoria, 
          as: 'categoria'
        },
        { 
          model: User, 
          as: 'autor',
          attributes: ['id', 'nome', 'email']
        },
        {
          model: ConhecimentoComentario,
          as: 'comentarios',
          where: { aprovado: true },
          required: false,
          include: [{
            model: User,
            as: 'usuario',
            attributes: ['id', 'nome']
          }],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!artigo) {
      return res.status(404).json({
        success: false,
        message: 'Artigo não encontrado'
      });
    }

    // Incrementar visualizações
    if (incrementar_visualizacao === 'true' || incrementar_visualizacao === true) {
      await artigo.increment('visualizacoes');
    }

    res.json({
      success: true,
      data: artigo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter artigo',
      error: error.message
    });
  }
};

exports.criarArtigo = async (req, res) => {
  try {
    const {
      titulo,
      conteudo,
      resumo,
      categoria_id,
      palavras_chave,
      tags,
      publico,
      destaque,
      status
    } = req.body;

    const artigo = await ConhecimentoArtigo.create({
      titulo,
      conteudo,
      resumo,
      categoria_id,
      autor_id: req.user.id,
      palavras_chave: palavras_chave || [],
      tags: tags || [],
      publico: publico || false,
      destaque: destaque || false,
      status: status || 'rascunho',
      publicado_em: status === 'publicado' ? new Date() : null,
      ativo: true
    });

    res.status(201).json({
      success: true,
      message: 'Artigo criado com sucesso',
      data: artigo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar artigo',
      error: error.message
    });
  }
};

exports.atualizarArtigo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      conteudo,
      resumo,
      categoria_id,
      palavras_chave,
      tags,
      publico,
      destaque,
      status,
      ativo
    } = req.body;

    const artigo = await ConhecimentoArtigo.findByPk(id);
    if (!artigo) {
      return res.status(404).json({
        success: false,
        message: 'Artigo não encontrado'
      });
    }

    const updateData = {
      titulo,
      conteudo,
      resumo,
      categoria_id,
      palavras_chave,
      tags,
      publico,
      destaque,
      status,
      ativo
    };

    // Se status mudou para publicado, registrar data
    if (status === 'publicado' && artigo.status !== 'publicado') {
      updateData.publicado_em = new Date();
    }

    await artigo.update(updateData);

    res.json({
      success: true,
      message: 'Artigo atualizado com sucesso',
      data: artigo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar artigo',
      error: error.message
    });
  }
};

exports.deletarArtigo = async (req, res) => {
  try {
    const { id } = req.params;

    const artigo = await ConhecimentoArtigo.findByPk(id);
    if (!artigo) {
      return res.status(404).json({
        success: false,
        message: 'Artigo não encontrado'
      });
    }

    await artigo.destroy();

    res.json({
      success: true,
      message: 'Artigo removido com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar artigo',
      error: error.message
    });
  }
};

exports.votarUtilidade = async (req, res) => {
  try {
    const { id } = req.params;
    const { voto } = req.body; // 'util' ou 'nao_util'

    if (!['util', 'nao_util'].includes(voto)) {
      return res.status(400).json({
        success: false,
        message: 'Voto inválido. Use "util" ou "nao_util"'
      });
    }

    const artigo = await ConhecimentoArtigo.findByPk(id);
    if (!artigo) {
      return res.status(404).json({
        success: false,
        message: 'Artigo não encontrado'
      });
    }

    await artigo.increment(voto);

    res.json({
      success: true,
      message: 'Voto registrado com sucesso',
      data: {
        util: artigo.util + (voto === 'util' ? 1 : 0),
        nao_util: artigo.nao_util + (voto === 'nao_util' ? 1 : 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar voto',
      error: error.message
    });
  }
};

// ===== COMENTÁRIOS =====

exports.adicionarComentario = async (req, res) => {
  try {
    const { id } = req.params; // artigo_id
    const { comentario } = req.body;

    const artigo = await ConhecimentoArtigo.findByPk(id);
    if (!artigo) {
      return res.status(404).json({
        success: false,
        message: 'Artigo não encontrado'
      });
    }

    const novoComentario = await ConhecimentoComentario.create({
      artigo_id: id,
      usuario_id: req.user.id,
      comentario,
      aprovado: false // Requer aprovação
    });

    res.status(201).json({
      success: true,
      message: 'Comentário adicionado e aguardando aprovação',
      data: novoComentario
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar comentário',
      error: error.message
    });
  }
};

exports.aprovarComentario = async (req, res) => {
  try {
    const { id } = req.params;

    const comentario = await ConhecimentoComentario.findByPk(id);
    if (!comentario) {
      return res.status(404).json({
        success: false,
        message: 'Comentário não encontrado'
      });
    }

    await comentario.update({ aprovado: true });

    res.json({
      success: true,
      message: 'Comentário aprovado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao aprovar comentário',
      error: error.message
    });
  }
};

exports.listarComentariosPendentes = async (req, res) => {
  try {
    const comentarios = await ConhecimentoComentario.findAll({
      where: { aprovado: false },
      include: [
        {
          model: ConhecimentoArtigo,
          as: 'artigo',
          attributes: ['id', 'titulo']
        },
        {
          model: User,
          as: 'usuario',
          attributes: ['id', 'nome', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: comentarios,
      total: comentarios.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar comentários pendentes',
      error: error.message
    });
  }
};
