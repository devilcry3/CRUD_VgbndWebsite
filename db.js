const mysql = require('mysql2/promise');
//Mysql database information and password

const pool = mysql.createPool({
    host: "crudabondtables.cnmi82ki8tut.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: process.env.DB_PASSWORD,
    database: "crudabond_database",
    port: 3306
});

module.exports = pool;

/*               project format, modular
project/
│
├── index.js              (main server)
├── db.js                 (database connection)
│
├── routes/
│   ├── characters.js     (GET routes)
│   ├── insert.js         (POST routes)
│   └── referencedata.js  (GET table data)
│
├── middleware/
│   ├── Validation.js     (validation functions)
│   └── upload.js         (Upload process)
│
├── public/
│   ├── index.html         (core index page, character table)
│   ├── creator.html       (character creation document)
│   ├── index.css          (css holding all style)
│   └── main.js            (data arrays)
*/