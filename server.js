import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ejs from 'ejs';

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const __dirname = dirname(fileURLToPath(import.meta.url));

import { router as apiRoute } from './api.js'
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
/*                                  Templates                                 */
/* -------------------------------------------------------------------------- */


const templates_data = {
    "login": {
        "path": __dirname + "/views/login.ejs"
    },
    "register": {
        "path": __dirname + "/views/register.ejs"
    },
    "group_list": {
        "path": __dirname + "/views/group_list.ejs"
    }
}

var templates = {}

for (let template in templates_data) {
    fs.readFile(
        templates_data[template].path,
        'utf8',
        function(err, data) {
            if (err) {
                console.error(err)
            } else {
                templates[template] = ejs.compile(data.toString(), {})

                console.log(template + " file load completed")
            }
        }
    )
}



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

app.get("/", (req, res) => {
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
        content: templates.group_list({
            text: lang,
            groups: []
        })
    })
})


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
        content: templates.register({text: lang})
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
        content: templates.login({text: lang})
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