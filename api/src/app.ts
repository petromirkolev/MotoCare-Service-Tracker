import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import bikesRouter from './routes/bikes';
import jobsRouter from './routes/jobs';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Moto Care Jobs API is running' });
});
app.use('/auth', authRouter);
app.use('/bikes', bikesRouter);
app.use('/jobs', jobsRouter);

export default app;
