import { z } from 'zod';

export const createCategoryValidator = z.object({
  name: z.string({
    message: 'name is empty',
  })
    .min(1, 'name is empty')
    .max(255, 'name length must not more than 255 characters'),
});
