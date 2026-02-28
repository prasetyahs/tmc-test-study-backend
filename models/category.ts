import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Product from './product';

class Category extends Model {
  public id!: string;
  public name!: string;
  public products?: Product[];
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Category.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'tbl_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Category;
