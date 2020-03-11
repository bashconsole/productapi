const Product = require('../models/Product');
const Barcode = require('../models/Barcode');
const config = require('../../config/');
const { Op } = require('sequelize');

function buildAttributes(fields) {
  const fieldsAllowed = [
    'productId',
    'title',
    'sku',
    'barcodes',
    'description',
    'attributes',
    'price',
    'created',
    'lastUpdated',
  ];

  let attributes = fieldsAllowed;

  if (fields) {
    const arr = fields.split(',');
    attributes = arr.filter((field) => fieldsAllowed.includes(field));
  }

  const result = attributes.map((field) => {
    if (field === 'productId') return ['product_id', 'productId'];
    if (field === 'created') return ['createdAt', 'created'];
    if (field === 'lastUpdated') return ['updatedAt', 'lastUpdated'];
    return field;
  }).filter((field) => {
    if (field === 'barcodes') return false;
    if (field === 'attributes') return false;
    return true;
  });

  return result;
}


const ProductController = () => {
  const addProduct = async (req, res) => {
    const {
      title, sku, description, barcodes, price,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        errorText: config.resultCodes.code400,
      });
    }

    if (!sku) {
      return res.status(400).json({
        errorText: config.resultCodes.code400,
      });
    }

    try {
      // check if sku already exists
      let product = await Product.findOne({
        where: {
          sku,
        },
      });

      if (product) {
        return res.status(400).json({
          errorText: `SKU '${sku}' already exists`,
        });
      }

      product = await Product.create({
        title,
        sku,
        description,
        price,
      });

      if (barcodes) {
        if (Array.isArray(barcodes)) {
          const codes = [];
          barcodes.forEach((barcode) => {
            codes.push({
              product_id: product.product_id,
              barcode,
            });
          });
          await Barcode.bulkCreate(codes);
        } else {
          return res.status(400).json({
            errorText: config.resultCodes.code400,
          });
        }
      }

      return res.status(201).send(String(product.product_id));
    } catch (err) {
      //       console.log(err);
      return res.status(500).json({
        errorText: config.resultCodes.code500,
      });
    }
  };

  const getProduct = async (req, res) => {
    const { id } = req.params;
    const { fields } = req.query;
    const attributes = buildAttributes(fields);

    try {
      const product = await Product.findOne({
        where: {
          product_id: id,
        },
        attributes,
      });

      if (!product) {
        return res.status(404).json({
          errorText: `Can't find product (${id})`,
        });
      }

      if (product.dataValues.created) {
        product.dataValues.created =
        Math.round(new Date(product.dataValues.created).getTime() / 1000);
      }
      if (product.dataValues.lastUpdated) {
        product.dataValues.lastUpdated =
        Math.round(new Date(product.dataValues.lastUpdated).getTime() / 1000);
      }


      if (!fields || fields.includes('barcode')) {
        const barcodes = await Barcode.findAll({
          where: {
            product_id: id,
          },
        });

        product.dataValues.barcodes = [];
        barcodes.forEach((code) => {
          product.dataValues.barcodes.push(code.barcode);
        });
      }

      return res.status(200).json(product);
    } catch (err) {
      return res.status(500).json({
        errorText: config.resultCodes.code500,
      });
    }
  };


  const getProducts = async (req, res) => {
    const {
      start, num, sku, barcode, fields,
    } = req.query;

    const filter = {
      offset: 0,
      limit: 10,
    };

    if (start && start - 1 > 0) {
      filter.offset = start - 1;
    }
    if (num) {
      filter.limit = num;
    }
    if (sku) {
      filter.where = {
        sku,
      };
    }

    filter.attributes = buildAttributes(fields);

    try {
      const total = await Product.count();

      let items = [];
      const productIds = [];

      if (!barcode || sku) {
        const products = await Product.findAll(filter);

        products.forEach((product) => {
          items.push(JSON.parse(JSON.stringify(product)));
          productIds.push(product.dataValues.productId);
        });
      }

      if (barcode) {
        const barcodesArr = await Barcode.findAll({
          where: {
            barcode,
          },
        });

        const barcodeIds = [];
        barcodesArr.forEach((b) => {
          barcodeIds.push(b.dataValues.product_id);
        });

        const barcodeProducts = await Product.findAll({
          where: {
            product_id: {
              [Op.in]: barcodeIds,
            },
          },
          attributes: filter.attributes,
        });

        barcodeProducts.forEach((product) => {
          if (!productIds.includes(product.dataValues.productId)) {
            items.push(JSON.parse(JSON.stringify(product)));
            productIds.push(product.dataValues.productId);
          }
        });
      }

      if ((!fields || fields.includes('barcode')) && productIds.length > 0) {
        const barcodes = await Barcode.findAll({
          where: {
            product_id: {
              [Op.in]: productIds,
            },
          },
        });

        const result = Object.keys(items).map((key) => {
          const arr = [];
          barcodes.forEach((code) => {
            if (code.dataValues.product_id === items[key].productId) {
              arr.push(code.dataValues.barcode);
            }
          });

          return {
            ...items[key],
            ...{ barcodes: arr },
          };
        });

        items = result;
      }

      items = Object.keys(items).map((key) => {
        if (items[key].created) {
          items[key].created =
                Math.round(new Date(items[key].created).getTime() / 1000);
        }
        if (items[key].lastUpdated) {
          items[key].lastUpdated =
                Math.round(new Date(items[key].lastUpdated).getTime() / 1000);
        }

        return items[key];
      });


      return res.status(200).json({
        totalCount: total,
        items,
      });
    } catch (err) {
      return res.status(500).json({
        errorText: config.resultCodes.code500,
      });
    }
  };

  const updateProduct = async (req, res) => {
    const { id } = req.params;
    const {
      title, sku, description, barcodes, price,
    } = req.body;

    try {
      // not clear about sku in task description
      //       if (!sku) {
      //         return res.status(400).json({
      //           errorText: 'Invalid sku, cannot be null',
      //         });
      //       }

      let product = await Product.findOne({
        where: {
          product_id: id,
        },
      });

      if (!product) {
        return res.status(404).json({
          errorText: `Can't find product (${id})`,
        });
      }

      const values = {};

      if (title) {
        values.title = title;
      }

      if (sku) {
        values.sku = sku;
        // check if sku already exists
        product = await Product.findOne({
          where: {
            [Op.and]: [
              { sku },
              { product_id: { [Op.ne]: id } }],
          },
        });

        if (product) {
          return res.status(400).json({
            errorText: `SKU '${sku}' already exists`,
          });
        }
      }

      if (description) {
        values.description = description;
      }

      if (price) {
        values.price = price;
      }

      if (barcodes) {
        if (Array.isArray(barcodes)) {
          const codes = [];
          barcodes.forEach((barcode) => {
            codes.push({
              product_id: id,
              barcode,
            });
          });

          // delete product barcodes
          await Barcode.destroy({
            where: {
              product_id: id,
            },
          });

          await Barcode.bulkCreate(codes);
        } else {
          return res.status(400).json({
            errorText: config.resultCodes.code400,
          });
        }
      }

      const result = await Product.update(values, {
        where: {
          product_id: id,
        },
      });

      return res.status(200).send(result[0] === 1);
    } catch (err) {
      return res.status(500).json({
        errorText: config.resultCodes.code500,
      });
    }
  };


  const deleteProduct = async (req, res) => {
    // params is part of an url
    const { id } = req.params;
    try {
      const product = await Product.findOne({
        where: {
          product_id: id,
        },
      });

      if (!product) {
        return res.status(404).json({
          errorText: `Product with productId (${id}) does not exist`,
        });
      }

      // delete product
      await product.destroy();

      // delete product barcodes
      await Barcode.destroy({
        where: {
          product_id: id,
        },
      });


      return res.status(200).send(true);
    } catch (err) {
      return res.status(500).json({
        errorText: config.resultCodes.code500,
      });
    }
  };


  return {
    addProduct,
    getProduct,
    getProducts,
    updateProduct,
    deleteProduct,
  };
};

module.exports = ProductController;

