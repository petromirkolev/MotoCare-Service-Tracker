"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBike = createBike;
exports.findBikeById = findBikeById;
exports.listBikesByUserId = listBikesByUserId;
exports.deleteBike = deleteBike;
const uuid_1 = require("uuid");
const db_helpers_1 = require("../db-helpers");
async function createBike(params) {
    const id = (0, uuid_1.v4)();
    await (0, db_helpers_1.runQuery)(`
      INSERT INTO bikes (id, user_id, make, model, year, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
        id,
        params.user_id,
        params.make,
        params.model,
        params.year,
        new Date().toISOString(),
    ]);
    return id;
}
async function findBikeById(id) {
    return (0, db_helpers_1.getOne)('SELECT * FROM bikes WHERE id = $1', [id]);
}
async function listBikesByUserId(user_id) {
    return (0, db_helpers_1.getAll)('SELECT * FROM bikes WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
}
async function deleteBike(params) {
    await (0, db_helpers_1.runQuery)(`
      DELETE FROM jobs
      WHERE bike_id = $1 AND user_id = $2
    `, [params.id, params.user_id]);
    await (0, db_helpers_1.runQuery)(`
      DELETE FROM bikes
      WHERE id = $1 AND user_id = $2
    `, [params.id, params.user_id]);
}
