import { Router } from 'express';
import { CreateBikeBody } from '../types/bike';
import { isIntegerInRange, normalizeString } from '../utils/validation';
import {
  createBike,
  deleteBike,
  listBikesByUserId,
} from '../services/bikes-service';

const bikesRouter = Router();

bikesRouter.get('/', async (req, res) => {
  const user_id = String(req.query.user_id ?? '').trim();

  if (!user_id) {
    res.status(400).json({ error: 'user_id query param is required' });
    return;
  }

  try {
    const bikes = await listBikesByUserId(user_id);
    res.json({ bikes });
  } catch (error) {
    console.error('List bikes failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

bikesRouter.post('/', async (req, res) => {
  const body = (req.body ?? {}) as CreateBikeBody;

  const user_id = normalizeString(body.user_id);
  const make = normalizeString(body.make);
  const model = normalizeString(body.model);
  const year = body.year;

  const user_bikes = await listBikesByUserId(user_id);

  const bikeAlreadyExists = user_bikes.some((bike) => {
    return bike.make === make && bike.model === model && bike.year === year;
  });

  if (bikeAlreadyExists) {
    res.status(400).json({ error: 'The bike already exists' });
    return;
  }

  if (!user_id || !make || !model || year === undefined) {
    res
      .status(400)
      .json({ error: 'userId, make, model, year, and odo are required' });
    return;
  }

  if (!isIntegerInRange(year, 1900, 2100)) {
    res
      .status(400)
      .json({ error: 'Year must be an integer between 1900 and 2100' });
    return;
  }

  try {
    await createBike({
      user_id,
      make,
      model,
      year,
    });

    res.status(201).json({ message: 'Bike created successfully' });
  } catch (error) {
    console.error('Create bike failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

bikesRouter.delete('/:id', async (req, res) => {
  const bike_id = req.params.id;
  const user_id = String(req.query.userId ?? '').trim();

  if (!bike_id || !user_id) {
    res.status(400).json({ error: 'ID and User ID are required' });
    return;
  }

  try {
    await deleteBike({
      id: bike_id,
      user_id,
    });

    res.json({ message: 'Bike deleted successfully' });
  } catch (error) {
    console.error('Delete bike failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default bikesRouter;
