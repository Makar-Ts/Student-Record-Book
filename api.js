const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var router = express.Router()


const sqlite3 = require("sqlite3").verbose()


const passwordHash = require('password-hash');



/* -------------------------------------------------------------------------- */
/*                              Database Connect                              */
/* -------------------------------------------------------------------------- */


const db = new sqlite3.Database('./database.db')



/* -------------------------------------------------------------------------- */
/*                                  Requests                                  */
/* -------------------------------------------------------------------------- */


const login_validator = require("./public/validator")


/* -------------------------------- Register -------------------------------- */

router.post("/register", urlencodedParser, (req, res) => {
    

    /* --------------------------- Validate POST Data --------------------------- */
    
    if(!req.body) return res.sendStatus(417);
    const p = req.body

    console.log(p)

    if (!(p.password && p.login && p.email)) return res.sendStatus(400);

    if (!(
        login_validator.validate_login(p.login) &&
        login_validator.validate_password(p.password) &&
        login_validator.validate_email(p.email)
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
        login_validator.validate_login(p.login) &&
        login_validator.validate_password(p.password)
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



module.exports = router;