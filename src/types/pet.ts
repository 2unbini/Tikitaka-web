export interface Pet {
  id?: string; // Supabase에서 생성되는 ID
  name: string;
  type: string;
  age: number;
  gender: string;
  breed: string;
  personality: string[];
  friend: string[];
  favorite: string;
  dislike: string;
  image: string;
  description: string;
  session_id: string; // 세션 ID
  owner_name: string; // 주인 이름
}
