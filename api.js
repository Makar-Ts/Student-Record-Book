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


/* -------------------------------- Register -------------------------------- */

router.post("/register", urlencodedParser, (req, res) => {
    if(!req.body) return res.sendStatus(417);
    const p = req.body

    console.log(p)

    if (!(p.password && p.login && p.email)) return res.sendStatus(409);

    db.run(
        "INSERT INTO Users (login, password_hash, email) VALUES(?, ?, ?)",
        [p.login, passwordHash.generate(p.password), p.email],
        function (err) {
            if (err) {
                console.error(err)

                res.sendStatus(409);
                res.end()
            } else {
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
    if(!req.body) return res.sendStatus(400);
    const p = req.body

    if (!(p.password && p.login)) return res.sendStatus(409);

    db.all(
        "SELECT * FROM Users WHERE login =?",
        [p.login],
        function (err, rows) {
            if (err) {
                console.error(err)
                
                return res.sendStatus(409)
            }

            if (!rows.length) {
                return res.sendStatus(401)
            }

            const user = rows[0]

            if (!passwordHash.verify(p.password, user.password_hash)) {
                return res.sendStatus(401)
            }

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