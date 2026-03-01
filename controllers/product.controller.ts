import { Request, Response } from 'express';
import Product from '../models/product';
import Category from '../models/category';
import { z } from 'zod';
import { createProductValidator } from '../validators/product.validator';
import { Op } from 'sequelize';
import sequelize from '../config/database';


export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = createProductValidator.parse(req.body);

    const existingSku = await Product.findOne({ where: { sku: validatedData.sku } });
    
    if (existingSku) {
      res.status(400).json({
        errors: {
          sku: ['sku is unique']
        }
      });
      return;
    }

    const product = await Product.create({
      sku: validatedData.sku,
      name: validatedData.name,
      price: validatedData.price.toString(), 
      stock: validatedData.stock,
      categoryId: validatedData.categoryId,
    });

    const category = await Category.findByPk(product.categoryId);

    res.status(200).json({
      data: {
        id: product.id,
        sku: product.sku,
        name: product.name,
        price: Number(product.price),
        stock: product.stock,
        category: category ? {
          id: category.id,
          name: category.name,
        } : null,
        createdAt: product.created_at.getTime(),
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

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query;
    
    const page = parseInt(query.page as string) || 1;
    const size = parseInt(query.size as string) || 10;
    const limit = size;
    const offset = (page - 1) * limit;

    const whereConditions: any[] = [];
    const categoryWhere: any = {};

    const asArray = (val: any) => {
      if (!val) return undefined;
      return Array.isArray(val) ? val : [val];
    };

    if (query.sku) {
      whereConditions.push({ sku: { [Op.in]: asArray(query.sku) } });
    }


    if (query.name) {
      const names = asArray(query.name);
      whereConditions.push({ 
        name: { 
          [Op.or]: names!.map((n: string) => ({ [Op.iLike]: `%${n}%` })) 
        } 
      });
    }

    if (query['price.start']) {
      whereConditions.push(
        sequelize.where(sequelize.cast(sequelize.col('Product.price'), 'INTEGER'), {
          [Op.gte]: Number(query['price.start'])
        })
      );
    }
    if (query['price.end']) {
      whereConditions.push(
        sequelize.where(sequelize.cast(sequelize.col('Product.price'), 'INTEGER'), {
          [Op.lte]: Number(query['price.end'])
        })
      );
    }

    if (query['stock.start']) {
      whereConditions.push({ stock: { [Op.gte]: parseInt(query['stock.start'] as string) } });
    }
    if (query['stock.end']) {
      whereConditions.push({ stock: { [Op.lte]: parseInt(query['stock.end'] as string) } });
    }

    if (query['category.id']) {
      categoryWhere.id = { [Op.in]: asArray(query['category.id']) };
    }

    if (query['category.name']) {
      categoryWhere.name = { [Op.in]: asArray(query['category.name']) };
    }

    const where = whereConditions.length > 0 ? { [Op.and]: whereConditions } : {};

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        {
          model: Category,
          as: 'category',
          where: Object.keys(categoryWhere).length > 0 ? categoryWhere : undefined,
          required: Object.keys(categoryWhere).length > 0,
        }
      ],
      order: [['created_at', 'DESC']],
      distinct: true,
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      data: rows.map(product => {
        const cat = (product as any).category;
        return {
          id: product.id,
          sku: product.sku,
          name: product.name,
          price: Number(product.price),
          stock: product.stock,
          category: cat ? {
            id: cat.id,
            name: cat.name
          } : null,
          createdAt: product.created_at.getTime()
        };
      }),
      paging: {
        size: limit,
        total: totalPages,
        current: page
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};
