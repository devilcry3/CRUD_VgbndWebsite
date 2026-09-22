const express = require('express');
const router = express.Router();

const pool = require('../db');
const upload = require('../middleware/upload');

//Reference data used in form drop downs

async function getTable(req, res, tableName) {
    try {
        const [rows] = await pool.query(`SELECT * FROM ${tableName}`);

        res
            .setHeader('Access-Control-Allow-Origin', '*')
            .json({ data: rows });

    } catch (error) {
        console.error(error);

        res.status(500)
            .setHeader('Access-Control-Allow-Origin', '*')
            .json({ message: 'Something went wrong with the server.' });
    }
}
router.get('/ancestry', upload.none(), async (req, res) => {
    await getTable(req, res, 'vagabond_ancestry');
});

router.get('/archetypes', upload.none(), async (req, res) => {
    await getTable(req, res, 'vagabond_archetypes');
});

router.get('/classes', upload.none(), async (req, res) => {
    await getTable(req, res, 'vagabond_classes');
});
module.exports = router;