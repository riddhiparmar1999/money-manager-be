import type { Request } from 'express';

export type JwtAccessPayload = {
  sub: string;
  email: string;
};

export type AuthenticatedUser = JwtAccessPayload;

export type RequestWithUser = Request & {
  user: AuthenticatedUser;
};
