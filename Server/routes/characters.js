const express = require('express');
const router = express.Router();
const pool = require('../db');

// =========================
// GET ALL CHARACTERS
// =========================
router.get('/', async (req, res) => {
    try {
        let sql;
        let params = [];
        let whereStatements = [];

        const reveal = req.query.reveal === 'TRUE';
        const prefix = reveal ? 'c.' : '';

        // BASE SELECT
        if (reveal) {
            sql = `
                SELECT c.*,
                    a.ancestry AS ancestry_name,
                    cl.class AS class_name,
                    ar.archetype AS archetype_name,
                    ar.slot_1, ar.slot_2, ar.slot_3,
                    ar.slot_4, ar.slot_5, ar.slot_6, ar.slot_7,
                    ar.gold, ar.silver, ar.copper,
                    a.ancestry_type,
                    cl.role
                FROM vagabond_characters c
                INNER JOIN vagabond_ancestry a ON c.ancestry_id = a.id
                INNER JOIN vagabond_classes cl ON c.class_id = cl.id
                INNER JOIN vagabond_archetypes ar ON c.archetype_id = ar.id
            `;
        } else {
            sql = `SELECT * FROM vagabond_characters`;
        }

        // FILTERS
        if (req.query.name && req.query.name.length > 0) {
            whereStatements.push(`${prefix}name LIKE ?`);
            params.push(`%${req.query.name}%`);
        }

        if (req.query.ancestry) {
            whereStatements.push(`${prefix}ancestry_id = ?`);
            params.push(req.query.ancestry);
        }

        // WHERE
        if (whereStatements.length > 0) {
            sql += ` WHERE ` + whereStatements.join(' AND ');
        }

        // SORT
        if (req.query.sort === 'ASC') {
            sql += ` ORDER BY ${prefix}level ASC`;
        } else if (req.query.sort === 'DESC') {
            sql += ` ORDER BY ${prefix}level DESC`;
        }

        // LIMIT
        const rowLimitValue = parseInt(req.query.rowLimit);
        if (!isNaN(rowLimitValue) && rowLimitValue > 0) {
            sql += ` LIMIT ?`;
            params.push(rowLimitValue);
        }

        const [rows] = await pool.query(sql, params);

        res.json({ data: rows });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});

// =========================
// GET SINGLE CHARACTER BY ID
// =========================
router.get('/:id', async (req, res) => {
    try {
        const sql = `
            SELECT c.*,
                a.ancestry AS ancestry_name,
                cl.class AS class_name,
                ar.archetype AS archetype_name,
                ar.slot_1, ar.slot_2, ar.slot_3,
                ar.slot_4, ar.slot_5, ar.slot_6, ar.slot_7,
                ar.gold, ar.silver, ar.copper,
                a.ancestry_type,
                cl.role
            FROM vagabond_characters c
            INNER JOIN vagabond_ancestry a ON c.ancestry_id = a.id
            INNER JOIN vagabond_classes cl ON c.class_id = cl.id
            INNER JOIN vagabond_archetypes ar ON c.archetype_id = ar.id
            WHERE c.id = ?
        `;

        const [rows] = await pool.query(sql, [req.params.id]);

        res.json({ data: rows });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Server error',
            error: err.message
        });
    }
});

module.exports = router;