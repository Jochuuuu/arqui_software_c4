export interface JwtPayload {
  sub: string;  // User ID
  email: string;
  name: string;
  iat?: number; // Issued at
  exp?: number; // Expires
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
}