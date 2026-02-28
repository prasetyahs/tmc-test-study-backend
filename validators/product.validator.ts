import { z } from 'zod';

export const createProductValidator = z.object({
  sku: z.string({
    message: 'sku is empty',
  }).min(1, 'sku is empty'),
  
  name: z.string({
    message: 'name is empty',
  })
    .min(1, 'name is empty')
    .max(255, 'name length must not more than 255 characters'),
    
  price: z.number({
    message: 'price is empty',
  }).min(0, 'price must not negative'),
  
  stock: z.number({
    message: 'stock is empty',
  }).min(0, 'stock must not negative'),
  
  categoryId: z.string({
    message: 'categoryId is empty',
  }).min(1, 'categoryId is empty'),
});
