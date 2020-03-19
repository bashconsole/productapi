# express-rest-api

Uses: Express, Sequelize, JEST, Supertest, ESLint.

## Install and Use

Start by cloning this repository

```sh
# HTTPS
$ git clone https://github.com/bashconsole/productapi.git
```

then

```sh
# cd into project root
$ npm i
# test
$ npm test
# start
$ npm start
```

sqlite is supported out of the box as it is the default. It is used for tests.

## Folder Structure

- api - for controllers, models, services, etc.
- config - for routes, database, etc.
- db - this is only a dir for the sqlite db, the default for NODE_ENV development
- test - using [Jest](https://github.com/facebook/jest)



##ESLint:

npx eslint api/controllers/ProductController.js --fix


--
Oleksii Zubvovskyi, bashconsole@gmail.com
