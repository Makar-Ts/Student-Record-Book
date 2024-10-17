import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ejs from 'ejs';


import sqlite3 from 'sqlite3';


import passwordHash from 'password-hash';

var router = express.Router();


const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const __dirname = dirname(fileURLToPath(import.meta.url));



/* -------------------------------------------------------------------------- */
/*                              Database Connect                              */
/* -------------------------------------------------------------------------- */


const db = new sqlite3.Database('./database.db')



/* -------------------------------------------------------------------------- */
/*                                  Requests                                  */
/* -------------------------------------------------------------------------- */


import { validate_email, validate_password, validate_login } from "./public/validator.js"


/* -------------------------------- Register -------------------------------- */

router.post("/register", urlencodedParser, (req, res) => {
    

    /* --------------------------- Validate POST Data --------------------------- */
    
    if(!req.body) return res.sendStatus(417);
    const p = req.body

    console.log(p)

    if (!(p.password && p.login && p.email)) return res.sendStatus(400);

    if (!(
        validate_login(p.login) &&
        validate_password(p.password) &&
        validate_email(p.email)
    )) return res.statusCode(406)


    /* ------------------------------- DB Request ------------------------------- */

    db.run(
        "INSERT INTO Users (login, password_hash, email) VALUES(?, ?, ?)",
        [
            p.login, 
            passwordHash.generate(p.password), 
            p.email
        ],
        function (err) {
            if (err) {
                console.error(err)

                res.sendStatus(500);
                res.end()
            } else {


                /* ---------------------------- Save Session Data --------------------------- */

                req.session.user_id = this.lastID
                req.session.login = p.login
                console.log("Registered new user: " + p.login + " with id " + req.session.user_id)

                res.sendStatus(200);
                res.end()
            }
        }
    )
})


/* ---------------------------------- Login --------------------------------- */

router.post("/login", urlencodedParser, (req, res) => {


    /* ------------------------------ Validate Data ----------------------------- */

    if(!req.body) return res.sendStatus(400);
    const p = req.body

    if (!(p.password && p.login)) return res.sendStatus(400);

    if (!(
        validate_login(p.login) &&
        validate_password(p.password)
    )) return res.sendStatus(406)


    /* ------------------------------- DB Request ------------------------------- */

    db.all(
        "SELECT * FROM Users WHERE login =?",
        [
            p.login
        ],
        function (err, rows) {


            /* ------------------------------- Check Data ------------------------------- */

            if (err) {
                console.error(err)
                
                return res.sendStatus(500)
            }

            if (!rows.length) {
                return res.sendStatus(401)
            }


            /* ----------------------------- Verify Password ---------------------------- */

            const user = rows[0]

            if (!passwordHash.verify(p.password, user.password_hash)) {
                return res.sendStatus(401)
            }


            /* ---------------------------- Save Session Data --------------------------- */

            req.session.user_id = user.id
            req.session.login = user.login
            console.log("Logged in user: " + p.login + " with id " + req.session.user_id)

            res.sendStatus(200);
            res.end()
        }
    )
})


/* --------------------------------- Logout --------------------------------- */

router.post("/logout", (req, res) => {
    try {
        req.session.destroy();

        res.sendStatus(200);
        res.end()
    } catch (error) {
        console.error(error)

        res.sendStatus(500);
        res.end()
    }
})



export { router }