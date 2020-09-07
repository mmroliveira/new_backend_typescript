const knex = require('knex');
const configuration_db = require('../../knexfile');

const connection_db = knex(configuration_db.development);

module.exports = connection_db;