const express = require('express');
const router = express.Router();

const pool = require('../db');
const upload = require('../middleware/upload');

router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        // =========================
        // ID VALIDATION
        // =========================
        if (!id || isNaN(id) || id <= 0) {
            return res.status(400).json({
                message: 'Valid character ID is required for deletion.'
            });
        }

        // =========================
        // CONFIRM CHARACTER EXISTS
        // =========================
        const [existing] = await pool.query(
            'SELECT id, image_name FROM vagabond_characters WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                message: 'Character not found.'
            });
        }

        // =========================
        // OPTIONAL IMAGE CLEANUP
        // =========================
        if (existing[0].image_name) {
            const fs = require('fs');
            const path = require('path');

            const imagePath = path.join(
                __dirname,
                '../server/uploads',
                existing[0].image_name
            );

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // =========================
        // DELETE CHARACTER
        // =========================
        const [result] = await pool.query(
            'DELETE FROM vagabond_characters WHERE id = ?',
            [id]
        );

        // Extra safety check
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Delete failed. Character may not exist.'
            });
        }

        res.status(200).json({
            message: 'Character deleted successfully.'
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: 'Server error occurred during deletion.',
            error: err.message
        });
    }
});

module.exports = router;