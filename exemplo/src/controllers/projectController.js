const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
router.use(authMiddleware);

router.get('/', (request, response) => {
    response.send({ok: 'true', user: request.userId});
})

module.exports = app => app.use('/projects', router);