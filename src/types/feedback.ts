export interface Feedback {
  id?: string;
  session_id: string;
  pet_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
}
