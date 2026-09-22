const { check, checkSchema, validationResult } = require('express-validator');
const pool = require('../db');

//contains functions that hold all of my created checks, these get called in the insert.js

// ===============================
// 1. BASIC FIELD VALIDATION
// ===============================
const baseValidators = [
    check('level', 'Is intended for levels 1-3')
        .notEmpty()
        .isInt({ min: 1, max: 3 }),

    check('stats', 'Choose your potential')
        .notEmpty(),

    check('perk', 'Too many characters')
        .isLength({ min: 0, max: 250 }),

    check('name', 'choose a new moniker')
        .notEmpty()
        .isLength({ min: 0, max: 50 }),
    check('hp', 'health must be int')
    .notEmpty()
        .isInt(),
    
];

const ancestryValidator = check('ancestry', 'What are you?')
    .notEmpty()
    .isInt()
    .custom(async (value) => {
        const [rows] = await pool.query(
            'SELECT id FROM vagabond_ancestry WHERE id = ?',
            [value]
        );

        if (rows.length === 0) {
            throw new Error('Invalid ancestry ID, What are you?');
        }

        return true;
    });


const classValidator = check('class', 'This is not your Destiny')
    .notEmpty()
    .isInt()
    .custom(async (value) => {
        const [rows] = await pool.query(
            'SELECT id FROM vagabond_classes WHERE id = ?',
            [value]
        );

        if (rows.length === 0) {
            throw new Error('This is not your Destiny, choose a class');
        }

        return true;
    });


const archetypeValidator = check('archetype', "That archetype does not exist here")
    .notEmpty()
    .isInt()
    .custom(async (value) => {
        const [rows] = await pool.query(
            'SELECT id FROM vagabond_archetypes WHERE id = ?',
            [value]
        );

        if (rows.length === 0) {
            throw new Error('That archetype does not exist here');
        }

        return true;
    });

    const statsValidator = check('stats', 'Choose your potential')
    .notEmpty()
    .custom((value) => {

        const receivedStats = value
            .split(',')
            .map(n => parseInt(n.trim(), 10))
            .sort((a, b) => b - a);

        const allowedBaseArrays = [
            [6, 6, 5, 3, 2, 2],
            [5, 5, 5, 4, 3, 2],
            [7, 6, 4, 3, 2, 2],
            [6, 5, 5, 4, 2, 2],
            [6, 6, 4, 4, 3, 2],
            [5, 5, 4, 4, 3, 3]
        ];

        const isValid = allowedBaseArrays.some(base =>
            base
                .slice()
                .sort((a, b) => b - a)
                .every((val, i) => val === receivedStats[i])
        );

        if (!isValid) {
            throw new Error('Invalid stat array selected.');
        }

        return true;
    });

    const filenameValidator = checkSchema({
    filename: {
        custom: {
            options: (value, { req }) => {

                if (!req.files || req.files.length === 0) return true;

                const invalidFile = req.files.find(file => {
                    const ext = require('path')
                        .extname(file.originalname)
                        .toLowerCase();

                    return ![".png", ".jpg", ".jpeg"].includes(ext);
                });

                if (invalidFile) {
                    throw new Error("Invalid file uploaded. Only PNG/JPG/JPEG allowed.");
                }

                return true;
            }
        }
    }
});

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400)
            .setHeader('Access-Control-Allow-Origin', '*')
            .json({
                message: 'Request fields or files are invalid.',
                errors: errors.array(),
            });
    }

    next();
};

module.exports = {
    baseValidators,
    ancestryValidator,
    classValidator,
    archetypeValidator,
    statsValidator,
    filenameValidator,
    handleValidation
};