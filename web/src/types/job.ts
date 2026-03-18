/* Type definition for a job */

export type Job = {
  id: string;
  user_id: string;
  bike_id: string;
  service_type: string;
  odometer: number;
  note: string;
  status: string;
  created_at: string;
};

export type ListJobResponse = {
  jobs: Job[];
};

export type CreateJobResponse = {
  message: string;
};

export type ErrorResponse = {
  error: string;
};
