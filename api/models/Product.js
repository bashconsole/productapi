const Sequelize = require('sequelize');
const sequelize = require('../../config/database');

const Product = sequelize.define('Product', {
  product_id: { type: Sequelize.DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  title: { type: Sequelize.DataTypes.STRING(32), allowNull: false },
  sku: { type: Sequelize.DataTypes.STRING(32), allowNull: false },
  description: { type: Sequelize.DataTypes.STRING(1024), allowNull: true },
  price: { type: Sequelize.DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0.00 },
}, {
  tableName: 'product',
  indexes: [{ fields: ['createdAt', 'updatedAt'] }],
});


module.exports = Product;
