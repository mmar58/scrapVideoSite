"use strict";
// Knex instance (shared across the app). We keep a modest connection pool
// because round settle batches open short-lived transactions; adjust sizing
Object.defineProperty(exports, "__esModule", { value: true });
exports.knex = void 0;
// for production traffic.
exports.knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        multipleStatements: true // convenience for potential raw maintenance scripts
    },
    pool: { min: 2, max: 10 }
});
