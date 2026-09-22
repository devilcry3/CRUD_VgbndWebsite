const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//Core node.js server page, uses routes and calls app usage from other route .js files

// ROUTES
const characters = require('./routes/characters');
const insert = require('./routes/insert');
const data = require('./routes/referencedata');
const edit = require('./routes/edit');
const remove = require('./routes/delete');
const port = 80;

app.use('/characters', characters);
app.use('/insert', insert);
app.use('/', data);
app.use('/edit', edit);
app.use('/delete', remove);

app.listen(port, () => {
    console.log(`Application listening at http://localhost:${port}`);
});