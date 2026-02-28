'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex('tbl_products', ['sku'], {
      name: 'tbl_products_sku_idx'
    });
    
    await queryInterface.addIndex('tbl_products', ['stock'], {
      name: 'tbl_products_stock_idx'
    });

    await queryInterface.addIndex('tbl_products', ['categoryId'], {
      name: 'tbl_products_categoryId_idx'
    });

    await queryInterface.addIndex('tbl_products', ['name'], {
      name: 'tbl_products_name_idx'
    });

    await queryInterface.sequelize.query('CREATE INDEX tbl_products_price_cast_idx ON tbl_products ((CAST(price AS INTEGER)));');

    await queryInterface.addIndex('tbl_categories', ['name'], {
      name: 'tbl_categories_name_idx'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('tbl_products', 'tbl_products_sku_idx');
    await queryInterface.removeIndex('tbl_products', 'tbl_products_stock_idx');
    await queryInterface.removeIndex('tbl_products', 'tbl_products_categoryId_idx');
    await queryInterface.removeIndex('tbl_products', 'tbl_products_name_idx');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS tbl_products_price_cast_idx;');
    await queryInterface.removeIndex('tbl_categories', 'tbl_categories_name_idx');
  }
};
