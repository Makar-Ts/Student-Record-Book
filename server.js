import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import AsyncHandler from 'express-async-handler';
import ejs from 'ejs';

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const __dirname = dirname(fileURLToPath(import.meta.url));

import { router as apiRoute, getAllGroups } from './api.js'
// route for API requests

import fs from 'fs';



/* -------------------------------------------------------------------------- */
/*                                Init Express                                */
/* -------------------------------------------------------------------------- */


var app = express()

app.use(express.static("./public"))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: 'secret fr fr',
        saveUninitialized: true,
    })
);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
// template directory

app.use("/api", apiRoute)



/* -------------------------------------------------------------------------- */
/*                                  Requests                                  */
/* -------------------------------------------------------------------------- */


/* -------------------------------- Language -------------------------------- */

const languages = {
    "en": JSON.parse(fs.readFileSync(__dirname + "/translations/en.json", 'utf8')),
    "ru": JSON.parse(fs.readFileSync(__dirname + "/translations/ru.json", 'utf8'))
}

function get_language(req) {
    var lang = req.headers['accept-language'];
    if (lang && lang.includes('ru')) {
        return languages.ru
    } else {
        return languages.en
    }
}


/* ---------------------------------- Main ---------------------------------- */

app.get("/", AsyncHandler(async (req, res) => {
    if (!req.session.user_id) { // if not logged in
        res.writeHead(302, {
            'Location': '/register'
        });
        return res.end();
    }

    var lang = get_language(req)

    res.render("main", {
        title: "StudentRecordBook - Main",
        account: {
            id: req.session.user_id,
            name: req.session.login
        },
        text: lang,
        is_file: true,
        content: [{
            file: "group_list",
            data: {
                text: lang,
                groups: await getAllGroups(req.session.user_id)
            }
        }]
    })
}))


/* -------------------------------- Register -------------------------------- */

app.get("/register", (req, res) => {
    var lang = get_language(req)

    res.render("main", {
        title: "StudentRecordBook - Register",
        account: {
            id: req.session.user_id,
            name: req.session.login
        },
        text: lang,
        is_file: true,
        content: [{
            file: "register",
            data: {
                text: lang
            }
        }]
    })
})


/* ---------------------------------- Login --------------------------------- */

app.get("/login", (req, res) => {
    var lang = get_language(req)

    res.render("main", {
        title: "StudentRecordBook - Login",
        account: {
            id: req.session.user_id,
            name: req.session.login
        },
        text: lang,
        is_file: true,
        content: [{
            file: "login",
            data: {
                text: lang
            }
        }]
    })
})



/* -------------------------------------------------------------------------- */
/*                                Start Server                                */
/* -------------------------------------------------------------------------- */


app.listen(3000, (err) => {
    if (!err) {
        console.log("Start ok")
    }

    console.error(err)
})