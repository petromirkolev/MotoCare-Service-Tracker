"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.createUser = createUser;
exports.verifyUserPassword = verifyUserPassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const db_helpers_1 = require("../db-helpers");
async function findUserByEmail(email) {
    return (0, db_helpers_1.getOne)('SELECT * FROM users WHERE email = $1', [email]);
}
async function createUser(email, password) {
    const password_hash = await bcrypt_1.default.hash(password, 10);
    await (0, db_helpers_1.runQuery)(`
      INSERT INTO users (id, email, password_hash, created_at)
      VALUES ($1, $2, $3, $4)
    `, [(0, uuid_1.v4)(), email, password_hash, new Date().toISOString()]);
}
async function verifyUserPassword(password, password_hash) {
    return bcrypt_1.default.compare(password, password_hash);
}
