export type UserRole = 'DOC' | 'INF' | 'AMM';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  isActive: boolean;
}
