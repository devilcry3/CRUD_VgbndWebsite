const express = require('express');
const router = express.Router();

const pool = require('../db');
const upload = require('../middleware/upload');

const {
    baseValidators,
    ancestryValidator,
    classValidator,
    archetypeValidator,
    statsValidator,
    filenameValidator,
    handleValidation
} = require('../middleware/validation');

// =========================
// UPDATE EXISTING CHARACTER
// =========================
router.put(
    '/:id',

    upload.array('filename'),

    baseValidators,
    ancestryValidator,
    classValidator,
    archetypeValidator,
    statsValidator,
    filenameValidator,
    handleValidation,

    async (req, res) => {
        try {
            const id = req.params.id;

            let { name, stats } = req.body;

            const {
                level,
                hp,
                ancestry,
                archetype,
                perk,
                class: class_id,
                currentImage
            } = req.body;

            const [might, dexterity, awareness, reason, presence, luck] =
                stats.split(',').map(Number);

            let image_name = currentImage || null;

            if (req.files?.[0]?.filename) {
                image_name = req.files[0].filename;
            }

            if (!name || name.trim() === '') {
                name = 'Default Jones';
            }

            const sql = `
                UPDATE vagabond_characters
                SET name = ?,
                    level = ?,
                    health_points = ?,
                    ancestry_id = ?,
                    class_id = ?,
                    archetype_id = ?,
                    might = ?,
                    dexterity = ?,
                    awareness = ?,
                    reason = ?,
                    presence = ?,
                    luck = ?,
                    image_name = ?,
                    perk = ?
                WHERE id = ?
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
                perk,
                id
            ];

            await pool.query(sql, params);

            res.json({
                message: 'Character updated successfully!'
            });

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