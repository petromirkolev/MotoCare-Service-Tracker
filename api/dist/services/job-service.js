"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = createJob;
exports.findJobById = findJobById;
exports.listJobsByUserId = listJobsByUserId;
exports.updateJobStatus = updateJobStatus;
exports.deleteJob = deleteJob;
const uuid_1 = require("uuid");
const db_helpers_1 = require("../db-helpers");
async function createJob(params) {
    const now = new Date().toISOString();
    const id = (0, uuid_1.v4)();
    await (0, db_helpers_1.runQuery)(`
      INSERT INTO jobs (id, user_id, bike_id, service_type, odometer, note, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
        id,
        params.user_id,
        params.bike_id,
        params.service_type,
        params.odometer,
        params.note,
        'requested',
        now,
        now,
    ]);
    return id;
}
async function findJobById(id) {
    return (0, db_helpers_1.getOne)('SELECT * FROM jobs WHERE id = $1', [id]);
}
async function listJobsByUserId(user_id) {
    return (0, db_helpers_1.getAll)('SELECT * FROM jobs WHERE user_id = $1 ORDER BY created_at DESC', [user_id]);
}
async function updateJobStatus(params) {
    await (0, db_helpers_1.runQuery)(`
      UPDATE jobs
      SET status = $1, updated_at = $2
      WHERE id = $3 AND user_id = $4
    `, [params.status, new Date().toISOString(), params.id, params.user_id]);
}
async function deleteJob(params) {
    await (0, db_helpers_1.runQuery)(`
      DELETE FROM jobs
      WHERE id = $1 AND user_id = $2
    `, [params.id, params.user_id]);
}
