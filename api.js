import { AsyncDatabase } from "promised-sqlite3";

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


import { randomBytes } from 'crypto'
import passwordHash from 'password-hash';

var router = express.Router();



/* -------------------------------------------------------------------------- */
/*                              Database Connect                              */
/* -------------------------------------------------------------------------- */


var db = undefined;
AsyncDatabase.open('./database.db').then((_db) => {
    db = _db
    console.log(db)
})



/* -------------------------------------------------------------------------- */
/*                                   Secure                                   */
/* -------------------------------------------------------------------------- */


function generateRandomToken(length) {
    const token = randomBytes(length).toString('base64');
    return token
        .replace(/\//g, '_')
        .replace(/\+/g, '-');
}



/* -------------------------------------------------------------------------- */
/*                                  Requests                                  */
/* -------------------------------------------------------------------------- */


import { 
    validate_email, 
    validate_password, 
    validate_login, 
    validate_group_name, 
    validate_group_code,
    validate_subject_name,
    validate_day,
    validate_time
} from "./public/validator.js"


/* -------------------------------- Register -------------------------------- */

router.post("/register", urlencodedParser, AsyncHandler(async (req, res) => {
    

    /* --------------------------- Validate POST Data --------------------------- */
    
    if(!req.body) return res.sendStatus(417);
    const p = req.body

    console.log(p)

    if (!(p.password && p.login && p.email)) return res.sendStatus(400);

    if (!(
        validate_login(p.login) &&
        validate_password(p.password) &&
        validate_email(p.email)
    )) return res.statusCode(400)


    /* ------------------------------- DB Request ------------------------------- */

    try {
        var row = 
            await db.run(
                "INSERT INTO Users (login, password_hash, email) VALUES(?, ?, ?)",
                [
                    p.login, 
                    passwordHash.generate(p.password), 
                    p.email
                ]
            );
    } catch (err) {
        console.error(err)

        return res.sendStatus(500);
    }

    req.session.user_id = row.lastID
    req.session.login = p.login
    console.log("Registered new user: " + p.login + " with id " + req.session.user_id)

    res.sendStatus(200);
    res.end()
    
}))


/* ---------------------------------- Login --------------------------------- */

router.post("/login", urlencodedParser, AsyncHandler(async (req, res) => {


    /* ------------------------------ Validate Data ----------------------------- */

    if(!req.body) return res.sendStatus(400);
    const p = req.body

    if (!(p.password && p.login)) return res.sendStatus(400);

    if (!(
        validate_login(p.login) &&
        validate_password(p.password)
    )) return res.sendStatus(400)


    /* ------------------------------- DB Request ------------------------------- */

    try {
        var row = 
            await db.get(
                "SELECT * FROM Users WHERE login =?",
                [
                    p.login
                ]
            );
    } catch (err) {
        console.error(err)
                
        return res.sendStatus(500)
    }
        
    
    if (!row) {
        return res.sendStatus(404)
    }


    /* ----------------------------- Verify Password ---------------------------- */

    const user = row

    if (!passwordHash.verify(p.password, user.password_hash)) {
        return res.sendStatus(401)
    }


    /* ---------------------------- Save Session Data --------------------------- */

    req.session.user_id = user.id
    req.session.login = user.login
    console.log("Logged in user: " + p.login + " with id " + req.session.user_id)

    res.sendStatus(200);
    res.end()
}))


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


/* -------------------------------------------------------------------------- */
/*                                   Groups                                   */
/* -------------------------------------------------------------------------- */

/* -------------------------- Get All User's Groups ------------------------- */

async function getAllGroups(user_id) {
    try {
        var rows = 
            await db.all(
                `SELECT g.id, g.name, g.description_short
                FROM Groups g
                JOIN GroupsMembers gm ON g.id = gm.group_id
                WHERE gm.member_id = ?`,
                [
                    user_id
                ]
            );

        return rows
    } catch (err) {
        console.error(err)

        return []
    }
}


/* -------------------------- Check Is Group Member ------------------------- */

async function isGroupMember(user_id, group_id) {
    try {
        var row = 
            await db.get(
                `SELECT role FROM GroupsMembers WHERE group_id =? AND member_id =?`,
                [
                    group_id,
                    user_id
                ]
            );
        
        return row ? row.role : -1;
    } catch (err) {
        console.error(err)

        return -1;
    }
}


/* ------------------------- Get All Group's Members ------------------------ */

async function getAllGroupMembers(group_id) {
    try {
        var rows = 
            await db.all(
                `SELECT u.id, u.login, u.email, gm.role
                FROM Users u
                JOIN GroupsMembers gm ON u.id = gm.member_id
                WHERE gm.group_id = ?`,
                [
                    group_id
                ]
            );

        return rows
    } catch (err) {
        console.error(err)

        return []
    }
}


/* ---------------------------- Get Group's Info ---------------------------- */

async function getGroupInfo(group_id) {
    try {
        var row = 
            await db.get(
                `SELECT g.id, g.name, g.description, g.description_short, g.invite_code, u.login AS owner_name, u.id AS owner_id
                FROM Groups g 
                JOIN Users u ON u.id = g.owner
                WHERE g.id =?`,
                [
                    group_id
                ]
            );

        return row
    } catch (err) {
        console.error(err)

        return null
    }
}


/* ---------------------------- Get All Subjects ---------------------------- */

async function getAllSubjects(group_id) {
    try {
        var rows = 
            await db.all(
                `SELECT id, name, description
                FROM GroupsSubjects
                WHERE "group" =?`,
                [
                    group_id
                ]
            );

        return rows
    } catch (err) {
        console.error(err)

        return []
    }
}


/* -------------------------------- Get Plan -------------------------------- */

async function getGroupPlan(group_id) {
    try {
        var rows = 
            await db.all(
                `SELECT gp.id, gp.time, gp.day_of_week, gs.name as name, gs.description as description
                FROM GroupsPlan gp
                JOIN GroupsSubjects gs ON gs.id = gp.subject_id
                WHERE "group_id"=?`,
                [
                    group_id
                ]
            );

        return rows
    } catch (err) {
        console.error(err)

        return []
    }
}



/* -------------------------------------------------------------------------- */
/*                               Group Requests                               */
/* -------------------------------------------------------------------------- */


/* ------------------------------ Create Group ------------------------------ */

router.post("/group/create", urlencodedParser, AsyncHandler(async (req, res) => {
    if(!req.body) return res.sendStatus(417);
    const p = req.body

    if (!req.session.user_id) return res.sendStatus(401); // if not logged in

    if (!(p.name)) return res.sendStatus(400);

    if (!(
        validate_group_name(p.name)
    )) return res.sendStatus(400)

    try {
        var result = 
            await db.run(
                "INSERT INTO Groups (name, description, description_short, owner, invite_code) VALUES(?,?,?,?,?)",
                [
                    p.name,
                    p.description,
                    p.description_short,
                    req.session.user_id,
                    generateRandomToken(64)
                ]);
        
        await db.run("INSERT INTO GroupsMembers (group_id, member_id, role) VALUES(?, ?, ?)",
            [
                result.lastID,
                req.session.user_id,
                0 // 0 - owner
            ]);
    } catch (err) {
        console.error(err)

        return res.sendStatus(500);
    }
    
    res.sendStatus(200)
}))


/* --------------------------- Join Group By Code --------------------------- */

router.post("/group/join", urlencodedParser, AsyncHandler(async (req, res) => {
    if(!req.body) return res.sendStatus(417);
    const p = req.body

    if (!req.session.user_id) return res.sendStatus(401); // if not logged in

    if (!(p.invite_code)) return res.sendStatus(400);

    if (!(
        validate_group_code(p.invite_code)
    )) return res.sendStatus(400)


    try {
        var row = 
            await db.get(
                "SELECT id FROM Groups WHERE invite_code =?",
                [
                    p.invite_code
                ]
            )
        
        if (!row) {
            return res.sendStatus(404)
        }


        await db.run("INSERT INTO GroupsMembers (group_id, member_id, role) VALUES(?,?,?)",
            [
                row.id,
                req.session.user_id,
                1 // 1 - member
            ]);
        
        res.sendStatus(200)
    } catch (err) {
        console.error(err)

        return res.sendStatus(500);
    }
}))


/* ------------------------- Regenerate Invite Code ------------------------- */

router.put("/group/:group_id/invite", urlencodedParser, AsyncHandler(async (req, res) => {
    if (!req.session.user_id) return res.sendStatus(401); // if not logged in

    var group_id = parseInt(req.params.group_id)
    if (await isGroupMember(req.session.user_id, group_id) != 0) return res.sendStatus(403); // if not group owner

    try {
        var new_invite_code = generateRandomToken(64)
        await db.run("UPDATE Groups SET invite_code =? WHERE id =?",
            [
                new_invite_code,
                group_id
            ])
        
        return res.sendStatus(200);
    } catch (err) {
        console.error(err);

        return res.sendStatus(500);
    }
}));


/* ------------------------- Kick Member From Group ------------------------- */

router.delete("/group/:group_id/members/:member_id", urlencodedParser, AsyncHandler(async (req, res) => {
    if (!req.session.user_id) return res.sendStatus(401); // if not logged in

    var group_id = parseInt(req.params.group_id)
    if (await isGroupMember(req.session.user_id, group_id) != 0) return res.sendStatus(403); // if not group owner

    var member_id = parseInt(req.params.member_id)
    try {
        await db.get(
            "DELETE FROM GroupsMembers WHERE group_id =? AND member_id =?",
            [
                group_id,
                member_id
            ]
        )
        
        return res.sendStatus(200)
    } catch (err) {
        console.error(err);

        return res.sendStatus(500);
    }
}))


/* --------------------------- Create New Subjects -------------------------- */

router.post("/group/:group_id/subjects", urlencodedParser, AsyncHandler(async (req, res) => {
    if (!req.session.user_id) return res.sendStatus(401); // if not logged in

    var group_id = parseInt(req.params.group_id)
    if (await isGroupMember(req.session.user_id, group_id) != 0) return res.sendStatus(403); // if not group owner

    if (!req.body) return res.sendStatus(417);
    const p = req.body


    try {
        const prepInsert = await db.prepare("INSERT INTO GroupsSubjects (`group`, name, description) VALUES(?, ?, ?)")

        for (var subject of p) {
            if (!(subject.name)) return res.sendStatus(400);

            if (!(
                validate_subject_name(subject.name)
            )) return res.sendStatus(400)

            await prepInsert.run(group_id, subject.name, subject.description)
        }

        await prepInsert.finalize()
        
        return res.sendStatus(200)
    } catch (err) {
        console.error(err);

        return res.sendStatus(500);
    }
}));


/* --------------------------- Update Old Subjects -------------------------- */

router.put("/group/:group_id/subjects", urlencodedParser, AsyncHandler(async (req, res) => {
    if (!req.session.user_id) return res.sendStatus(401); // if not logged in

    var group_id = parseInt(req.params.group_id)
    if (await isGroupMember(req.session.user_id, group_id)!= 0) return res.sendStatus(403); // if not group owner

    if (!req.body) return res.sendStatus(417);
    const p = req.body

    try {
        const prepUpdate = await db.prepare("UPDATE GroupsSubjects SET name =?, description =? WHERE `group` =? AND id =?")

        for (var subject of p) {
            if (!(subject.id)) return res.sendStatus(400);
        
            if (!(subject.name)) return res.sendStatus(400);

            if (!(
                validate_subject_name(subject.name)
            )) return res.sendStatus(400)

            await prepUpdate.run(subject.name, subject.description, group_id, subject.id)
        }

        await prepUpdate.finalize()
        
        return res.sendStatus(200)
    } catch (e) {
        console.error(err);

        return res.sendStatus(500);
    }
}));


/* --------------------------- Add Subject To Plan --------------------------- */

router.put("/group/:group_id/plan", urlencodedParser, AsyncHandler(async (req, res) => {
    if(!req.body) return res.sendStatus(417);
    const p = req.body

    if (!req.session.user_id) return res.sendStatus(401); // if not logged in

    if (!(p.id && p.time && p.subject_id)) return res.sendStatus(400);

    try {
        await db.run(
            "INSERT INTO GroupsPlan (group_id, subject_id, time) VALUES(?,?,?)",
            [
                req.params.group_id,
                p.subject_id,
                p.time
            ]
        );
    } catch (err) {
        console.error(err)
    }
}))


/* --------------------------- Delete Subject From Plan --------------------------- */

router.delete("/group/:group_id/plan", urlencodedParser, AsyncHandler(async (req, res) => {
    if(!req.body) return res.sendStatus(417);
    const p = req.body

    if (!req.session.user_id) return res.sendStatus(401); // if not logged in

    if (!(p.id && p.subject_id)) return res.sendStatus(400);

    try {
        await db.run(
            "DELETE FROM GroupsPlan WHERE group_id =? AND subject_id =?",
            [
                req.params.group_id,
                p.subject_id
            ]
        );
    } catch (err) {
        console.error(err)
    }
}))


/* --------------------------- Add Lesson To Plan --------------------------- */

router.post("/group/:group_id/plan", urlencodedParser, AsyncHandler(async (req, res) => {
    if (!req.session.user_id) return res.sendStatus(401);
    const group_id = parseInt(req.params.group_id);
    
    if (await isGroupMember(req.session.user_id, group_id) != 0) {
        return res.sendStatus(403);
    }

    const { subject_id, time, day_of_week } = req.body;
    
    if (!validate_time(time) || !validate_day(day_of_week)) {
        return res.sendStatus(400);
    }

    try {
        await db.run(
            "INSERT INTO GroupsPlan (group_id, subject_id, time, day_of_week) VALUES (?, ?, ?, ?)",
            [group_id, subject_id, time, day_of_week]
        );
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}));


/* ------------------------------- Get Lesson ------------------------------- */

router.get("/group/:group_id/plan/:lesson_id", urlencodedParser, AsyncHandler(async (req, res) => {
    if (!req.session.user_id) return res.sendStatus(401);
    const { group_id, lesson_id } = req.params;
    
    if (await isGroupMember(req.session.user_id, group_id) != 0) {
        return res.sendStatus(403);
    }

    try {
        const row = await db.get(
            `SELECT time, subject_id, day_of_week
            FROM GroupsPlan
            WHERE id =?`,
            [lesson_id]
        )

        res.status(200);
        res.json(row);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}))


/* ------------------------------ Update Lesson ----------------------------- */

router.patch("/group/:group_id/plan/:lesson_id", urlencodedParser, AsyncHandler(async (req, res) => {
    if (!req.session.user_id) return res.sendStatus(401);
    const { group_id, lesson_id } = req.params;
    
    if (await isGroupMember(req.session.user_id, group_id) != 0) {
        return res.sendStatus(403);
    }

    const { time, subject_id } = req.body;
    
    if (time && !validate_time(time)) return res.sendStatus(400);

    try {
        const updates = [];
        const params = [];
        
        if (time) {
            updates.push("time =?");
            params.push(time);
        }
        if (subject_id) {
            updates.push("subject_id =?");
            params.push(subject_id);
        }
        
        params.push(lesson_id);
        await db.run(
            `UPDATE GroupsPlan SET ${updates.join(", ")} WHERE id =?`,
            params
        );
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}));


/* ------------------------------ Delete Lesson ----------------------------- */

router.delete("/group/:group_id/plan/:lesson_id", urlencodedParser, AsyncHandler(async (req, res) => {
    if (!req.session.user_id) return res.sendStatus(401);
    const { group_id, lesson_id } = req.params;
    
    if (await isGroupMember(req.session.user_id, group_id) != 0) {
        return res.sendStatus(403);
    }

    try {
        await db.run("DELETE FROM GroupsPlan WHERE id = ?", [lesson_id]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
}));



export { router, getAllGroups, isGroupMember, getAllGroupMembers, getGroupInfo, getAllSubjects, getGroupPlan }