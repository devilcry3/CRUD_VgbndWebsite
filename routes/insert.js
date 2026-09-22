const express = require('express');
const router = express.Router();

const pool = require('../db');
const upload = require('../middleware/upload');

//Is the route .js that calls the validation functions and then creates
//isert statement that is sent to my MySQL


const {
    baseValidators,
    ancestryValidator,
    classValidator,
    archetypeValidator,
    statsValidator,
    filenameValidator,
    handleValidation
} = require('../middleware/validation');

router.post(
    '/',

    upload.array('filename'),

    // validation chain (UNCHANGED LOGIC)
    baseValidators,
    ancestryValidator,
    classValidator,
    archetypeValidator,
    statsValidator,
    filenameValidator,
    handleValidation,

    async (req, res) => {
        try {

            let { name, stats } = req.body;

            const {
                level,
                hp,
                ancestry,
                archetype,
                perk,
                class: class_id
            } = req.body;

            const [might, dexterity, awareness, reason, presence, luck] =
                stats.split(',').map(Number);

            const image_name = req.files?.[0]?.filename || null;

            if (!name || name.trim() === '') {
                name = 'Default Jones';
            }

            const sql = `
                INSERT INTO vagabond_characters
                (name, level, health_points, ancestry_id, class_id,
                 archetype_id, might, dexterity, awareness,
                 reason, presence, luck, image_name, perk)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                name,
                level,
                hp,
                ancestry,
                class_id,
                archetype,
                might,
                dexterity,
                awareness,
                reason,
                presence,
                luck,
                image_name,
                perk
            ];

            await pool.query(sql, params);

            res.json({ message: 'Form submission was successful!' });

        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: 'Server error occurred.',
                error: err.message
            });
        }
    }
);

module.exports = router;