"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runQuery = runQuery;
exports.getOne = getOne;
exports.getAll = getAll;
const db_1 = require("./db");
async function runQuery(sql, params = []) {
    await db_1.db.query(sql, params);
}
async function getOne(sql, params = []) {
    const result = await db_1.db.query(sql, params);
    return result.rows[0];
}
async function getAll(sql, params = []) {
    const result = await db_1.db.query(sql, params);
    return result.rows;
}
