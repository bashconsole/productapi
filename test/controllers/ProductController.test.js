const request = require('supertest');

const {
  beforeAction,
  afterAction,
} = require('../setup/_setup');
const Product = require('../../api/models/Product');

let api;

beforeAll(async () => {
  api = await beforeAction();
});

afterAll(() => {
  afterAction();
});

let res;

describe('product', () => {
  test('create', async () => {
    res = await request(api)
      .post('/api/products')
      .set('Accept', 'text/plain')
      .send({
        title: 'Test product',
        sku: 'SCK-1234',
        description: 'Test product description',
        price: 12.34,
      })
      .expect('Content-Type', /text/)
      .expect(201);

    expect(Number(res.text)).toBe(1);

    // check if product with sku already exists
    const res2 = await request(api)
      .post('/api/products')
      .set('Accept', 'text/plain')
      .send({
        title: 'Test product',
        sku: 'SCK-1234',
        description: 'Test product description',
        price: 12.34,
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res2.body.errorText).toBe('SKU \'SCK-1234\' already exists');
  });

  test('get product by id', async () => {
    const product = await Product.findByPk(Number(res.text));

    expect(product.product_id).toBe(Number(res.text));

    res = await request(api)
      .get(`/api/products/${product.product_id}`)
      .set('Accept', /json/)
      .expect('Content-Type', /json/)
      .expect(200);

    // matches product properties
    expect(product.product_id).toBe(res.body.productId);
    expect(product.title).toBe(res.body.title);
    expect(product.description).toBe(res.body.description);
    expect(product.sku).toBe(res.body.sku);
    expect(product.price).toBe(res.body.price);
    expect(Math.round(new Date(product.createdAt).getTime() / 1000)).toEqual(res.body.created);
    expect(Math.round(new Date(product.updatedAt).getTime() / 1000)).toEqual(res.body.lastUpdated);

    res = await request(api)
      .get('/api/products/10')
      .set('Accept', /json/)
      .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body.errorText).toBe("Can't find product (10)");
  });

  test('get products', async () => {
    const results = [];
    for (let i = 2; i < 12; i += 1) {
      results.push(request(api)
        .post('/api/products')
        .set('Accept', /json/)
        .send({
          title: `Test product ${i} `,
          sku: `SCK-1234${i}`,
          description: `Test product description ${i}`,
          price: 12.34 + i,
        })
        .expect(201));
    }

    await Promise.all(results);

    res = await request(api)
      .get('/api/products')
      .set('Accept', /json/)
      .expect(200);

    // matches count and length
    expect(res.body.totalCount).toBe(11);
    expect(res.body.items.length).toBe(10);
    // matches first and last product id
    expect(res.body.items[0].productId).toBe(1);
    expect(res.body.items[9].productId).toBe(10);
  });

  test('get products with filters', async () => {
    res = await request(api)
      .get('/api/products?start=2&num=5&fields=productId,title')
      .set('Accept', /json/)
      .expect(200);

    // matches start position
    expect(res.body.items[0].productId).toBe(2);
    // matches number of items returned
    expect(res.body.items.length).toBe(5);

    res = await request(api)
      .get('/api/products?sku=SCK-1234&fields=productId,title,sku,description,lastUpdated')
      .set('Accept', /json/)
      .expect(200);

    expect(res.body.items.length).toBe(1);
    expect(Object.keys(res.body.items[0]).length).toBe(5);
    expect(res.body.items[0].productId).toBe(1);
    expect(res.body.items[0].title).toBe('Test product');
    expect(res.body.items[0].sku).toBe('SCK-1234');
    expect(res.body.items[0].description).toBe('Test product description');
    expect(res.body.items[0].lastUpdated).toBeTruthy();
  });

  test('update product', async () => {
    res = await request(api)
      .put('/api/products/2')
      .send({
        title: 'Test product 1',
        sku: 'SCK-1234',
        description: 'Test product 1 description',
      })
      .set('Accept', 'text/plain')
      .expect(400);

    res = await request(api)
      .put('/api/products/1')
      .send({
        title: 'Test product 1',
        sku: 'SCK-1234', // the same sku (unchanged)
        description: 'Test product 1 description',
      })
      .set('Accept', 'text/plain')
      .expect(200);


    res = await request(api)
      .put('/api/products/1')
      .send({
        title: 'Test product 11',
        description: 'Test product 11 description',
      })
      .set('Accept', 'text/plain')
      .expect(200);

    expect(res.text).toBe('true');
  });


  test('delete product', async () => {
    res = await request(api)
      .delete('/api/products/2')
      .set('Accept', 'text/plain')
      .expect(200);

    expect(res.text).toBe('true');

    res = await request(api)
      .delete('/api/products/2')
      .set('Accept', /json/)
      .expect(404);
  });

  test('create product with barcodes', async () => {
    res = await request(api)
      .post('/api/products')
      .set('Accept', 'text/plain')
      .send({
        title: 'Test product with barcodes',
        sku: 'SCK-123400',
        barcodes: ['7410123423489', '7410123423480', '7410123423490'],
        description: 'Test product with barcodes description',
        price: 12.34,
      })
      .expect(201);

    expect(Number(res.text)).toBeGreaterThan(0);

    res = await request(api)
      .get(`/api/products/${Number(res.text)}?fields=sku,barcodes`)
      .set('Accept', /json/)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Object.keys(res.body).length).toBe(2);
    expect(res.body.sku).toBe('SCK-123400');
    expect(res.body.barcodes.length).toBe(3);

    res = await request(api)
      .get('/api/products?start=11&num=1')
      .set('Accept', /json/)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.items[0].barcodes.length).toBe(3);
  });

  test('update product with barcodes', async () => {
    res = await request(api)
      .post('/api/products')
      .set('Accept', 'text/plain')
      .send({
        title: 'Test product with barcodes',
        sku: 'SCK-1234111',
        barcodes: ['7110123423480', '7110123423481', '7110123423482'],
        description: 'Test product with barcodes description',
        price: 12.34,
      })
      .expect(201);

    await request(api)
      .put(`/api/products/${Number(res.text)}`)
      .send({
        title: 'Test update product',
        sku: 'SCK-2222',
        description: 'Test update product description',
        barcodes: ['9110123423480', '9110123423481', '9110123423482'],
      })
      .set('Accept', 'text/plain')
      .expect(200);

    res = await request(api)
      .get(`/api/products/${Number(res.text)}?fields=sku,barcodes`)
      .set('Accept', /json/)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body.sku).toBe('SCK-2222');
    expect(res.body.barcodes).toEqual(['9110123423480', '9110123423481', '9110123423482']);
  });

  test('get products barcode parameter', async () => {
    res = await request(api)
      .get('/api/products?sku=SCK-1234&barcode=9110123423480')
      .set('Accept', /json/)
      .expect(200);

    expect(res.body.items.length).toBe(2);

    res = await request(api)
      .get('/api/products?barcode=9110123423480')
      .set('Accept', /json/)
      .expect(200);

    expect(res.body.items.length).toBe(1);

    res = await request(api)
      .get('/api/products?sku=SCK-1234&fields=sku,barcode')
      .set('Accept', /json/)
      .expect(200);

    expect(res.body.items.length).toBe(1);
  });
});

