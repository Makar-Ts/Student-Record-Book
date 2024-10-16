const express = require("express")
const session = require('express-session')
const bodyParser = require('body-parser')

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const apiRoute = require('./api');


const ejs = require("ejs")



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

app.use("/api", apiRoute)


/* -------------------------------------------------------------------------- */
/*                                  Requests                                  */
/* -------------------------------------------------------------------------- */


/* ---------------------------------- Main ---------------------------------- */

app.get("/", (req, res) => {
    if (!req.session.user_id) {
        res.writeHead(302, {
            'Location': '/register'
        });
        return res.end();
    }

    res.render("en/main", {
        title: "StudentRecordBook - Main",
        account: {
            id: req.session.user_id,
            name: req.session.login
        },
        content: ""
    })
})


/* ---------------------------- Login & Register ---------------------------- */

var register_template = undefined
ejs.renderFile(__dirname + "/views/en/register.ejs", {}, {}, function(err, str){
    if (err) {
        console.error(err)

        return
    }

    register_template = str

    console.log("Register file render completed")
});

app.get("/register", (req, res) => {
    res.render("en/main", {
        title: "StudentRecordBook - Register",
        account: undefined,
        content: register_template
    })
})


var login_template = undefined
ejs.renderFile(__dirname + "/views/en/login.ejs", {}, {}, function(err, str){
    if (err) {
        console.error(err)

        return
    }

    login_template = str

    console.log("Login file render completed")
})

app.get("/login", (req, res) => {
    res.render("en/main", {
        title: "StudentRecordBook - Login",
        account: undefined,
        content: login_template
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