const express = require('express');
const router = express.Router();
const { User, Role } = require('../../models');

router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll({
      include: [{ model: Role, as: 'roles' }],
      order: [['nome', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const user = await User.create({
      ...req.body,
      criado_por: req.user.id
    });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    await user.update({
      ...req.body,
      atualizado_por: req.user.id
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
