"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_1 = require("../utils/validation");
const bikes_service_1 = require("../services/bikes-service");
const bikes_router = (0, express_1.Router)();
bikes_router.get('/', async (req, res) => {
    const user_id = String(req.query.user_id ?? '').trim();
    if (!user_id) {
        res.status(400).json({ error: 'user_id query param is required' });
        return;
    }
    try {
        const bikes = await (0, bikes_service_1.listBikesByUserId)(user_id);
        res.json({ bikes });
    }
    catch (error) {
        console.error('List bikes failed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
bikes_router.post('/', async (req, res) => {
    const body = (req.body ?? {});
    const user_id = (0, validation_1.normalizeString)(body.user_id);
    const make = (0, validation_1.normalizeString)(body.make);
    const model = (0, validation_1.normalizeString)(body.model);
    const year = body.year || undefined;
    const user_bikes = await (0, bikes_service_1.listBikesByUserId)(user_id);
    const bikeAlreadyExists = user_bikes.some((bike) => {
        return bike.make === make && bike.model === model && bike.year === year;
    });
    if (bikeAlreadyExists) {
        res.status(400).json({ error: 'The bike already exists' });
        return;
    }
    if (!user_id) {
        res.status(400).json({ error: 'user_id is required' });
        return;
    }
    if (!make) {
        res.status(400).json({ error: 'Make is required' });
        return;
    }
    if (!model) {
        res.status(400).json({ error: 'Model is required' });
        return;
    }
    if (year === undefined) {
        res.status(400).json({ error: 'Year is required' });
        return;
    }
    if (!(0, validation_1.isIntegerInRange)(year, 1900, 2100)) {
        res
            .status(400)
            .json({ error: 'Year must be an integer between 1900 and 2100' });
        return;
    }
    try {
        const bike_id = await (0, bikes_service_1.createBike)({
            user_id,
            make,
            model,
            year,
        });
        res.status(201).json({
            message: 'Bike created successfully',
            bike: {
                id: bike_id,
            },
        });
    }
    catch (error) {
        console.error('Create bike failed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
bikes_router.delete('/:id', async (req, res) => {
    const bike_id = req.params.id;
    const user_id = String(req.query.user_id ?? '').trim();
    if (!bike_id || !user_id) {
        res.status(400).json({ error: 'bike_id and user_id are required' });
        return;
    }
    try {
        await (0, bikes_service_1.deleteBike)({
            id: bike_id,
            user_id,
        });
        res.json({ message: 'Bike deleted successfully' });
    }
    catch (error) {
        console.error('Delete bike failed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = bikes_router;
