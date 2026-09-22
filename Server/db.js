const mysql = require('mysql2/promise');
//Mysql database information and password

const pool = mysql.createPool({
    host: "student-databases.cvode4s4cwrc.us-west-2.rds.amazonaws.com",
    user: "BRANDONWILLIAMS40",
    password: "dAdOQ6xNTO2PoF3cPyl1RAz7SFKLbJrq7E5",
    database: "BRANDONWILLIAMS40"
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