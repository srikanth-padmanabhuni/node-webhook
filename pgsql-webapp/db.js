const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'NodeTraining',
    password: '$Sri@Krishna_143$',
    port: 5432,
});

module.exports = pool;