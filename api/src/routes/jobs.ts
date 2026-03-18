import { Router } from 'express';
import { createJob, listJobsByUserId } from '../services/job-service';
import { CreateJobBody } from '../types/job';
import { normalizeString } from '../utils/validation';

const jobsRouter = Router();

jobsRouter.get('/', async (req, res) => {
  const user_id = String(req.query.user_id ?? '').trim();

  if (!user_id) {
    res.status(400).json({ error: 'user_id query param is required' });
    return;
  }

  try {
    const jobs = await listJobsByUserId(user_id);
    res.json({ jobs });
  } catch (error) {
    console.error('List jobs failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

jobsRouter.post('/', async (req, res) => {
  const user_id = String(req.query.user_id ?? '').trim();

  if (!user_id) {
    res.status(400).json({ error: 'user_id query param is required' });
    return;
  }
  const body = (req.body ?? {}) as CreateJobBody;

  const bike_id = normalizeString(body.bike_id);
  const service_type = normalizeString(body.service_type);
  const odometer = body.odometer;
  const note = normalizeString(body.note ?? '');

  if (
    !bike_id ||
    !service_type ||
    odometer === undefined ||
    odometer === null
  ) {
    res.status(400).json({
      error: 'bike_id, service_type, and odometer are required',
    });
    return;
  }

  try {
    await createJob({
      user_id,
      bike_id,
      service_type,
      odometer,
      note,
    });

    res.status(201).json({ message: 'Job created successfully' });
  } catch (error) {
    console.error('Create job failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default jobsRouter;
