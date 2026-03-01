import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import categoriesRouter from './routes/categories';
import productsRouter from './routes/products';
import searchRouter from './routes/search';
import sequelize from './config/database';
import { requireApiKey } from './middlewares/auth.middleware';

const app = express();

sequelize.authenticate()
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Protect these API endpoints with the API_KEY check
app.use('/api/categories', requireApiKey, categoriesRouter);
app.use('/api/products', requireApiKey, productsRouter);
app.use('/api/search', requireApiKey, searchRouter);

export default app;
