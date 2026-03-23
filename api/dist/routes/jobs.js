"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const job_service_1 = require("../services/job-service");
const validation_1 = require("../utils/validation");
const jobs_router = (0, express_1.Router)();
jobs_router.get('/', async (req, res) => {
    const user_id = String(req.query.user_id ?? '').trim();
    if (!user_id) {
        res.status(400).json({ error: 'user_id query param is required' });
        return;
    }
    try {
        const jobs = await (0, job_service_1.listJobsByUserId)(user_id);
        res.json({ jobs });
    }
    catch (error) {
        console.error('List jobs failed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
jobs_router.post('/', async (req, res) => {
    const user_id = String(req.query.user_id ?? '').trim();
    if (!user_id) {
        res.status(400).json({ error: 'user_id query param is required' });
        return;
    }
    const body = (req.body ?? {});
    const bike_id = (0, validation_1.normalizeString)(body.bike_id);
    const service_type = (0, validation_1.normalizeString)(body.service_type);
    const odometer = body.odometer;
    const note = (0, validation_1.normalizeString)(body.note ?? '');
    if (!bike_id) {
        res.status(400).json({
            error: 'bike_id is required',
        });
        return;
    }
    if (!service_type) {
        res.status(400).json({
            error: 'service_type is required',
        });
        return;
    }
    if (odometer === undefined || odometer === null) {
        res.status(400).json({
            error: 'odometer is required',
        });
        return;
    }
    if (odometer < 0) {
        res.status(400).json({
            error: 'odometer cannot be a negative integer',
        });
        return;
    }
    if (typeof odometer === 'string') {
        res.status(400).json({
            error: 'odometer must be a number',
        });
        return;
    }
    try {
        const id = await (0, job_service_1.createJob)({
            user_id,
            bike_id,
            service_type,
            odometer,
            note,
        });
        res.status(201).json({
            message: 'Job created successfully',
            id,
        });
    }
    catch (error) {
        console.error('Create job failed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
jobs_router.patch('/:id/status', async (req, res) => {
    const id = String(req.params.id ?? '').trim();
    const user_id = String(req.query.user_id ?? '').trim();
    const status = String(req.body?.status ?? '').trim();
    if (!id) {
        res.status(400).json({ error: 'id query param is required' });
        return;
    }
    if (!user_id) {
        res.status(400).json({ error: 'user_id query param is required' });
        return;
    }
    if (!status) {
        res.status(400).json({ error: 'status is required' });
        return;
    }
    try {
        const job = await (0, job_service_1.findJobById)(id);
        if (!job) {
            res.status(404).json({ error: 'Job not found' });
            return;
        }
        if (job.user_id !== user_id) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        const allowedStatuses = ['approved', 'in_progress', 'done', 'cancelled'];
        if (!allowedStatuses.includes(status)) {
            res.status(400).json({ error: 'Invalid status value' });
            return;
        }
        const allowedTransitions = {
            requested: ['approved', 'cancelled'],
            approved: ['in_progress', 'cancelled'],
            in_progress: ['done'],
            done: [],
            cancelled: [],
        };
        const nextAllowedStatuses = allowedTransitions[job.status] ?? [];
        if (!nextAllowedStatuses.includes(status)) {
            res.status(400).json({
                error: `Invalid status transition from ${job.status} to ${status}`,
            });
            return;
        }
        await (0, job_service_1.updateJobStatus)({
            id,
            user_id,
            status,
        });
        const updatedJob = await (0, job_service_1.findJobById)(id);
        res.json({
            message: 'Job status updated successfully',
            job: updatedJob,
        });
    }
    catch (error) {
        console.error('Update job status failed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = jobs_router;
