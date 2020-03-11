const Sequelize = require('sequelize');
const sequelize = require('../../config/database');

const Barcode = sequelize.define('Barcode', {
  product_id: { type: Sequelize.DataTypes.INTEGER.UNSIGNED, primaryKey: true },
  barcode: { type: Sequelize.DataTypes.STRING(32), allowNull: false, primaryKey: true },
}, {
  tableName: 'product_barcode',
  indexes: [{ fields: ['barcode'] }],
});


module.exports = Barcode;
