const express = require("express")
const session = require('express-session')
const bodyParser = require('body-parser')

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const apiRoute = require('./api');
// route for API requests


const fs = require('fs');


const ejs = require("ejs")
// template system



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
        content: ""
    })
})


/* -------------------------------- Register -------------------------------- */

var register_template = undefined
fs.readFile(
    __dirname + "/views/register.ejs",
    'utf8',
    function(err, data){
        if (err) {
            console.error(err)
    
            return
        }
    
        register_template =  ejs.compile(data.toString(), {})
        // compile template for faster load in future
    
        console.log("Register file load completed")
});

app.get("/register", (req, res) => {
    var lang = get_language(req)

    res.render("main", {
        title: "StudentRecordBook - Register",
        account: {
            id: req.session.user_id,
            name: req.session.login
        },
        text: lang,
        content: register_template({text: lang})
    })
})


/* ---------------------------------- Login --------------------------------- */

var login_template = undefined
fs.readFile(
    __dirname + "/views/login.ejs",
    'utf8',
    function(err, data){
    if (err) {
        console.error(err)

        return
    }

    login_template = ejs.compile(data.toString(), {})
    // compile template for faster load in future

    console.log("Login file load completed")
})

app.get("/login", (req, res) => {
    var lang = get_language(req)

    res.render("main", {
        title: "StudentRecordBook - Login",
        account: {
            id: req.session.user_id,
            name: req.session.login
        },
        text: lang,
        content: login_template({text: lang})
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