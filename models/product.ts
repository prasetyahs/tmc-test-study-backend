import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Category from './category';

class Product extends Model {
  public id!: string;
  public sku!: string;
  public name!: string;
  public price!: string;
  public stock!: number;
  public categoryId!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Product.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Category,
      key: 'id',
    }
  },
}, {
  sequelize,
  tableName: 'tbl_products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});



Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

export default Product;
