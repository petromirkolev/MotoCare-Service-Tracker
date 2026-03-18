export type CreateJobBody = {
  bike_id?: string;
  service_type?: string;
  odometer?: number;
  note?: string;
};

export type JobRow = {
  id: string;
  user_id: string;
  bike_id: string;
  service_type: string;
  odometer: number;
  note: string;
  status: string;
  created_at: string;
  updated_at: string;
};
