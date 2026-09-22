//Libraries
const express = require('express');
const multer = require('multer');
const path = require('path');

/*
    IMPORTANT CHANGE:
     now using mysql2/promise instead of mysql2

    WHY:
    - Allows use of async/await instead of callbacks
    - Cleaner and easier to manage
    - switched to it mainly for check methods acessing database information
*/
const mysql = require('mysql2/promise');

const { check, checkSchema, validationResult } = require('express-validator');
const { CLASS_STAT_PRIORITY } = require('./main.js');
const { ABILITIES } = require('./main.js');

//Setup defaults for script
const app = express();
const port = 80;

/*
================================================================================
 CONNECTION vs POOL EXPLANATION
================================================================================

OLD (SINGLETON CONNECTION) — what you had before:
------------------------------------------------
const connection = mysql.createConnection({...});

- Only ONE connection to the database
- All queries share it
- Requests are effectively queued
- If it disconnects → your app can break
- OK for small/local apps

NEW (POOL) — what you're using now:
-----------------------------------
*/
const pool = mysql.createPool({
    host: "student-databases.cvode4s4cwrc.us-west-2.rds.amazonaws.com",
    user: "BRANDONWILLIAMS40",
    password: "dAdOQ6xNTO2PoF3cPyl1RAz7SFKLbJrq7E5",
    database: 'BRANDONWILLIAMS40'
});

/*
WHY POOL:
- Maintains multiple connections internally
- Handles multiple simultaneous requests
- More stable (auto-manages dropped connections)
- Better for scaling your app later

For your current project:
- Benefit is small now
- But useful as this app grows or is integrated to larger development
*/


//.diskstorage is choosing local drive storage
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads/');
    },
    filename: function (req, file, callback) {
        callback(
            null,
            path.parse(file.originalname).name +
            '-' +
            Date.now() +
            path.parse(file.originalname).ext
        );
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
        const allowedExtensions = [".png", ".jpg", ".jpeg"];

        const ext = path.extname(file.originalname).toLowerCase();

        if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(ext)) {
            console.log("Rejected file:", file.originalname, file.mimetype);
            return callback(new Error("Invalid file type. Only images are allowed."));
        }

        callback(null, true);
    }
});

/*
================================================================================
 GET ROUTES — FIXED
================================================================================

IMPORTANT CHANGE:
- mysql2/promise DOES NOT support callback style
- Must use async/await

OLD :
pool.query(sql, callback)

NEW :
const [rows] = await pool.query(sql)
*/

//JSON for ancestry
app.get('/ancestry/', upload.none(), async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM vagabond_ancestry');

        res
            .setHeader('Access-Control-Allow-Origin', '*')
            .json({ data: rows });

    } catch (error) {
        console.error(error);
        res.status(500)
            .setHeader('Access-Control-Allow-Origin', '*')
            .json({ message: 'Something went wrong with the server.' });
    }
});

app.get('/archetypes/', upload.none(), async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM vagabond_archetypes');

        res
            .setHeader('Access-Control-Allow-Origin', '*')
            .json({ data: rows });

    } catch (error) {
        console.error(error);
        res.status(500)
            .setHeader('Access-Control-Allow-Origin', '*')
            .json({ message: 'Something went wrong with the server.' });
    }
});

app.get('/classes/', upload.none(), async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM vagabond_classes');

        res
            .setHeader('Access-Control-Allow-Origin', '*')
            .json({ data: rows });

    } catch (error) {
        console.error(error);
        res.status(500)
            .setHeader('Access-Control-Allow-Origin', '*')
            .json({ message: 'Something went wrong with the server.' });
    }
});


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// POST route
app.post(
    '/',
    upload.array('filename'),

    // --- Validators ---

    check('level', 'Is intended for levels 1-3')
        .notEmpty()
        .isInt({ min: 1, max: 3 }),

    /*
    IMPORTANT CHANGE:
    - Now validating against DATABASE instead of hardcoded values
    - Uses pool.query with async/await
    */
    check('ancestry', 'What are you?')
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
        }),

    check('class', 'This is not your Destiny')
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
        }),

    check('archetype', "That archetype does not exist here")
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
        }),

    check('stats', 'Choose your potential')
        .notEmpty()
        .custom((value) => {
            //this takes the sent stat array reorganizes it to high to low, same with allowed base arrays
            //it then copares the stat array values one by one against each of the base arrays to see if it matches any of them.
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
        }),

    check('perk', 'Too many characters')
        .isLength({ min: 0, max: 250 }),

    checkSchema({
        filename: {
            custom: {
                options: (value, { req }) => {
                    if (!req.files || req.files.length === 0) return true;

                    const invalidFile = req.files.find(file => {
                        const ext = path.extname(file.originalname).toLowerCase();
                        return ![".png", ".jpg", ".jpeg"].includes(ext);
                    });

                    if (invalidFile) {
                        throw new Error("Invalid file uploaded. Only PNG/JPG/JPEG allowed.");
                    }

                    return true;
                }
            }
        }
    }),

    // --- Route handler ---
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400)
                    .setHeader('Access-Control-Allow-Origin', '*')
                    .json({
                        message: 'Request fields or files are invalid.',
                        errors: errors.array(),
                    });
            }

            /*
            IMPORTANT FIXES:
            - stats was undefined → now pulled from req.body
            - name reassignment fixed
            */

            let { name, stats } = req.body;
            const { level, hp, ancestry, archetype, perk, class: class_id } = req.body; 
            //you can not do a const/let/var of class in javascript. but by doing class: class_id it automatically associates
            //the req.body of class to class_id.

            const [might, dexterity, awareness, reason, presence, luck] = stats.split(',').map(Number);
            const image_name = req.files?.[0]?.filename || null;
            const ancestry_id = ancestry;
            const archetype_id = archetype;

            if (!name || name.trim() === '') {
                name = 'Default Jones';
            }

            const insertSql = ` INSERT INTO vagabond_characters 
                (name, level, health_points, ancestry_id, class_id, archetype_id, might, dexterity, awareness, reason, presence, luck, image_name, perk)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            let queryParameters = [
                name,
                level,
                hp,
                ancestry_id,
                class_id,
                archetype_id,
                might,
                dexterity,
                awareness,
                reason,
                presence,
                luck,
                image_name,
                perk
            ];

            /*
            IMPORTANT CHANGE:
            - Using await instead of callback
            */
            await pool.query(insertSql, queryParameters);

            res
                .setHeader('Access-Control-Allow-Origin', '*')
                .json({ message: 'Form submission was succesful!' });

        } catch (err) {
            console.error('Unexpected error in POST /:', err);
            res.status(500)
                .setHeader('Access-Control-Allow-Origin', '*')
                .json({ message: 'Server error occurred.', error: err.message });
        }
    }
);


// --- Multer error handler ---
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message.includes('Invalid file type')) {
        return res.status(400)
            .setHeader('Access-Control-Allow-Origin', '*')
            .json({
                message: 'File upload failed',
                errors: [{ param: 'filename', msg: err.message }]
            });
    }
    next(err);
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});