const publicRoutes = {
  'POST /products': 'ProductController.addProduct',
  'GET /products': 'ProductController.getProducts',
  'GET /products/:id': 'ProductController.getProduct',
  'PUT /products/:id': 'ProductController.updateProduct',
  'DELETE /products/:id': 'ProductController.deleteProduct',

};

module.exports = publicRoutes;
