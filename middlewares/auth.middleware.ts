import { Request, Response, NextFunction } from 'express';

export const requireApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const validApiKey = process.env.API_KEY;

  if (!authHeader) {
    res.status(401).json({
      message: 'Unauthorized'
    });
    return;
  }

  const providedKey = authHeader;

  if (providedKey !== validApiKey) {
    res.status(403).json({
      message: 'Forbidden: Invalid API Key'
    });
    return;
  }

  next();
};
