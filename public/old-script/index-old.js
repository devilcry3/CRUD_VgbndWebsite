//Libraries
const express = require('express');
const multer = require('multer');
const mysql = require('mysql2/promise');
// const course = require('./Model/course');

//Setup defaults for script
const app = express();
app.use(express.static('public'))

const upload = multer()
const port = 80 //Default port to http server

let connection = null;

async function query(sql, params) {
    //Singleton DB connection
    if (null === connection) {
        console.log('Here');
        connection = await mysql.createConnection({
            host: "student-databases.cvode4s4cwrc.us-west-2.rds.amazonaws.com",
            user: "BRANDONWILLIAMS40",
            password: "dAdOQ6xNTO2PoF3cPyl1RAz7SFKLbJrq7E5",
            database: 'BRANDONWILLIAMS40'
        });
    }

    const [results,] = await connection.execute(sql, params);
    return results;
}


//The * in app.* needs to match the method type of the request
//applget is a method on how we deal with an http get request for the path /noun/
app.get(
    //this should be the noun for your API (for example the table name)
    //for final we will have 5 different app.*, for example the app.get(/characters/)
    '/characters/',
    //upload.none says no file uploads
    upload.none(),
    async (request, response) => {
        let result = {};
        try {
            if (request.query.reveal === 'TRUE') {
                selectSql = `SELECT c.*,
                                a.ancestry AS ancestry_name,
                                cl.class AS class_name,
                                ar.archetype AS archetype_name, ar.slot_1, ar.slot_2, ar.slot_3,
                                ar.slot_4, ar.slot_5, ar.slot_6, ar.slot_7,
                                ar.gold, ar.silver, ar.copper, a.ancestry_type,
                                cl.role
                            FROM vagabond_characters c
                            INNER JOIN vagabond_ancestry a 
                                ON c.ancestry_id = a.id
                            INNER JOIN vagabond_classes cl 
                                ON c.class_id = cl.id
                            INNER JOIN vagabond_archetypes ar 
                                ON c.archetype_id = ar.id`;

            } else {
                selectSql =
                    `SELECT *
                FROM vagabond_characters`;
            }
            whereStatements = [],
                orderByStatements = [],
                queryParameters = [];

            let limiting = ""; //used for when wanting to limit how many results are shown

            const useAlias = request.query.reveal === 'TRUE'; const prefix = useAlias ? 'c.' : '';
            //used for the dynamic approach to inserting names. prefix checks true or not to know if c. or empty space shoudl be there
            // this makes each stament have the c. or not flexibly suggested through chat gpt and upon thinking about it, though felt complicated at first
            //made more sense then having extra written if statements or multiple cross checks. makes it simpler and easier to use dynamically./////////////////////////////////////////////////////////////////


            //request.query."parameternamehere" the parameter name should match the html document
            if (typeof request.query.ancestry !== 'undefined') {
                //the push statements parameter call like, whereStatements.push("ancestry_id = ?") should use the tables names
                whereStatements.push(prefix + "ancestry_id = ?");
                queryParameters.push(request.query.ancestry)

            }


            if (typeof request.query.name !== 'undefined' && request.query.name.length > 0) {
                whereStatements.push(prefix + "name LIKE ?");
                queryParameters.push(`%${request.query.name}%`);

            }


            if (typeof request.query.sort !== 'undefined') {
                if (request.query.sort === "ASC") {
                    orderByStatements.push(prefix + "level ASC");
                } else if (request.query.sort === "DESC") {
                    orderByStatements.push(prefix + "level DESC");
                }

            }

            if (typeof request.query.rowLimit !== 'undefined' && parseInt(request.query.rowLimit) > 0) {

              limiting = ' LIMIT ' + parseInt(request.query.rowLimit);

            }


            //Dynamically add WHERE expressions to SELECT statements if needed
            if (whereStatements.length > 0) {
                selectSql = selectSql + ' WHERE ' + whereStatements.join(' AND ');

            }

            //Dynamically add ORDER BY expressions to SELECT statements if needed
            if (orderByStatements.length > 0) {
                selectSql = selectSql + ' ORDER BY ' + orderByStatements.join(', ');
            }

            //Dynamically add LIMIT expressions to SELECT statements if needed
            if (parseInt(request.query.rowLimit) > 0) {
                selectSql = selectSql + limiting;
            }

            result = await query(selectSql, queryParameters);

        } catch (error) {
            console.log(error);
            return response.status(500) //Error code 
                .json({ message: 'Something went wrong with the server.' });
        }
        //Default response object
        response.json({ 'data': result });
        console.log(connection.config.database);
    });

app.listen(port, () => {
    console.log(`Application listening at http://localhost:${port}`);
})