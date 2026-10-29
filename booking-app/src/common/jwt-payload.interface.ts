export interface JwtPayload {
  sub: number; // usually the user ID
  email: string;
  role: string;
}