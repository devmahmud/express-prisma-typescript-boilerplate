import { z } from 'zod';

export const password = z
  .string()
  .min(8, 'password must be at least 8 characters')
  .refine(
    (value) => value.match(/\d/) && value.match(/[a-zA-Z]/),
    'Password must contain at least 1 letter and 1 number'
  );
