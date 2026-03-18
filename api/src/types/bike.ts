export type CreateBikeBody = {
  user_id?: string;
  make?: string;
  model?: string;
  year?: number;
};

export type BikeRow = {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  created_at: string;
};
