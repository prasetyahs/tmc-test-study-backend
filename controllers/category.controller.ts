import { Request, Response } from 'express';
import Category from '../models/category';
import { z } from 'zod';
import { createCategoryValidator } from '../validators/category.validator';

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createCategoryValidator.parse(req.body);

    const category = await Category.create({ name: validatedData.name });

    res.status(200).json({
      data: {
        id: category.id,
        name: category.name,
        createdAt: category.created_at.getTime(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string[]> = {};
      
      for (const issue of error.issues) {
        const path = issue.path[0] ? issue.path.join('.') : 'body';
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        if (!formattedErrors[path].includes(issue.message)) {
          formattedErrors[path].push(issue.message);
        }
      }

      res.status(400).json({
        errors: formattedErrors,
      });
      return;
    }

    res.status(500).json({
      message: 'Internal server error',
    });
  }
};
