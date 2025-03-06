export interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  delay?: number;
  image?: string;
}
