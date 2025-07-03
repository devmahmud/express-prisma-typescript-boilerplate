import { User } from '@prisma/client';

export interface TokenResponse {
  token: string;
  expires: Date;
}

export interface AuthTokensResponse {
  access: TokenResponse;
  refresh?: TokenResponse;
}

import { Role } from '@prisma/client';

// Extend the User type to ensure it has the required properties
export interface ExtendedUser extends User {
  id: string;
  role: Role[];
}

declare global {
  namespace Express {
    interface Request {
      user?: ExtendedUser;
    }
  }
}
