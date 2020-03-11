# express-rest-api

## Install and Use

Start by cloning this repository

```sh
# HTTPS
$ git clone https://github.com/bashconsole/productapi.git
```

then

```sh
# cd into project root
$ yarn
# to use mysql
$ yarn add mysql2
# to use postgresql
$ yarn add pg pg-hstore
# start the api
$ yarn start
```

or

```sh
# cd into project root
$ npm i
# to use mysql
$ npm i mysql2 -S
# to use postgresql
$ npm i -S pg pg-hstore
# start the api
$ npm start
```

sqlite is supported out of the box as it is the default.

## Folder Structure

- api - for controllers, models, services, etc.
- config - for routes, database, etc.
- db - this is only a dir for the sqlite db, the default for NODE_ENV development
- test - using [Jest](https://github.com/facebook/jest)



##ESLint:

npx eslint api/controllers/ProductController.js --fix


