import { 
    express,
    session,
    useragent,
    bodyParser,
    jsonParser,
    urlencodedParser,
    AsyncHandler,
    ejs,
    __dirname,
    fs
} from './includes.js'

import * as api from './api.js'
import * as utils from './utils.js'

import { router as groupsRoute } from './groups.js'


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

app.use(useragent.express());

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
// template directory

app.use("/api", api.router)
app.use("/groups", groupsRoute)

app.use((req, res, next) => {
    var url = new URL(`http://${process.env.HOST ?? 'localhost'}${req.url}`);

    if (
        url.pathname.match(/^\/login\/?$/)          ||
        url.pathname.match(/^\/register\/?$/)       ||
        url.pathname.match(/^\/api\/login\/?$/)     ||
        url.pathname.match(/^\/api\/register\/?$/)
    ) {
        next();
        
        return;
    }

    if (!req.session.user_id) { // if not logged in
        res.status(302);
        res.redirect('/register');
        return res.end();
    }

    next();
})


/* -------------------------------------------------------------------------- */
/*                                  Requests                                  */
/* -------------------------------------------------------------------------- */


/* ---------------------------------- Main ---------------------------------- */

app.get("/", AsyncHandler(async (req, res) => {
    var lang = utils.get_language(req)

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
                groups: await api.getAllGroups(req.session.user_id)
            }
        }]
    })
}));



/* -------------------------------------------------------------------------- */
/*                                Auntification                               */
/* -------------------------------------------------------------------------- */


/* -------------------------------- Register -------------------------------- */

app.get("/register", (req, res) => {
    var lang = utils.get_language(req)

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
    var lang = utils.get_language(req)

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


app.listen(8080, (err) => {
    if (!err) {
        console.log("Start ok")
    }

    console.error(err)
})