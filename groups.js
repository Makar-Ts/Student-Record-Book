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

var router = express.Router();



/* -------------------------------------------------------------------------- */
/*                               Groups Requests                              */
/* -------------------------------------------------------------------------- */


/* --------------------------- Root Page Redirect --------------------------- */

router.get("/:group_id/", AsyncHandler(async (req, res) => {
    var group_id = parseInt(req.params.group_id)
    var member_role = await api.isGroupMember(req.session.user_id, group_id)

    if (member_role == -1) {
        res.writeHead(403, {
            'Location': '/'
        });
        return res.end();
    }

    res.writeHead(308, {
        'Location': `/groups/${group_id}/main`
    });
    res.end();
}));


/* -------------------------------- Main Page ------------------------------- */

router.get("/:group_id/main", AsyncHandler(async (req, res) => {
    var lang = utils.get_language(req)

    var group_id = parseInt(req.params.group_id)
    var member_role = await api.isGroupMember(req.session.user_id, group_id)

    if (member_role == -1) {
        res.writeHead(403, {
            'Location': '/'
        });
        return res.end();
    }


    res.render("main", {
        title: `StudentRecordBook - Group ${group_id}`,
        account: {
            id: req.session.user_id,
            name: req.session.login
        },
        text: lang,
        is_file: true,
        content: [{
            file: `group/tabs/${member_role == 0 ? "owner" : "member"}`,
            data: {
                text: lang,
                group_id: group_id,
                active_tab: 0
            }
        }]
    })
}));


/* ------------------------------ Members Page ------------------------------ */

router.get("/:group_id/members", AsyncHandler(async (req, res) => {
    var lang = utils.get_language(req)

    var group_id = parseInt(req.params.group_id)
    var member_role = await api.isGroupMember(req.session.user_id, group_id)

    if (member_role == -1) {
        res.writeHead(403, {
            'Location': '/'
        });
        return res.end();
    }

    res.render("main", {
        title: `StudentRecordBook - Group ${group_id}`,
        account: {
            id: req.session.user_id,
            name: req.session.login
        },
        text: lang,
        is_file: true,
        content: [
            {
                file: `group/tabs/${member_role == 0? "owner" : "member"}`,
                data: {
                    text: lang,
                    group_id: group_id,
                    active_tab: 2
                }
            }, 
            {
                file:`group/members/${member_role == 0? "owner" : "member"}`,
                data: {
                    text: lang,
                    group_id: group_id,
                    members: await api.getAllGroupMembers(group_id)
                }
            }
        ]
    })
}));


/* -------------------------------- Info Page ------------------------------- */

router.get("/:group_id/info", AsyncHandler(async (req, res) => {
    var lang = utils.get_language(req)

    var group_id = parseInt(req.params.group_id)
    var member_role = await api.isGroupMember(req.session.user_id, group_id)

    if (member_role == -1) {
        res.writeHead(403, {
            'Location': '/'
        });
        return res.end();
    }


    res.render("main", {
        title: `StudentRecordBook - Group ${group_id}`,
        account: {
            id: req.session.user_id,
            name: req.session.login
        },
        text: lang,
        is_file: true,
        content: [
            {
                file: `group/tabs/${member_role == 0? "owner" : "member"}`,
                data: {
                    text: lang,
                    group_id: group_id,
                    active_tab: 1
                }
            }, 
            {
                file: `group/info/${member_role == 0? "owner" : "member"}`,
                data: {
                    text: lang,
                    is_mobile: req.useragent.isMobile,
                    group_info: await api.getGroupInfo(group_id)
                }
            }
        ]
    })
}));



/* -------------------------------------------------------------------------- */
/*                            Group Admin Requests                            */
/* -------------------------------------------------------------------------- */


/* ------------------------------ Subjects Page ----------------------------- */

router.get("/:group_id/subjects", AsyncHandler(async (req, res) => {
    var lang = utils.get_language(req)

    var group_id = parseInt(req.params.group_id)
    var member_role = await api.isGroupMember(req.session.user_id, group_id)

    if (member_role != 0) {
        res.writeHead(403, {
            'Location': '/'
        });
        return res.end();
    }

    res.render("main", {
        title: `StudentRecordBook - Group ${group_id}`,
        account: {
            id: req.session.user_id,
            name: req.session.login
        },
        text: lang,
        is_file: true,
        content: [
            {
                file: `group/tabs/${member_role == 0? "owner" : "member"}`,
                data: {
                    text: lang,
                    group_id: group_id,
                    active_tab: 4
                }
            }, 
            {
                file: `group/subjects/${member_role == 0? "owner" : "member"}`,
                data: {
                    text: lang,
                    subjects: await api.getAllSubjects(group_id)
                }
            }
        ]
    })
}));


/* --------------------------- Edit Subjects Page --------------------------- */

router.get("/:group_id/subjects/edit", AsyncHandler(async (req, res) => {
    var lang = utils.get_language(req)

    var group_id = parseInt(req.params.group_id)
    var member_role = await api.isGroupMember(req.session.user_id, group_id)

    if (member_role != 0) {
        res.writeHead(403, {
            'Location': '/'
        });
        return res.end();
    }


    res.render("main", {
        title: `StudentRecordBook - Group ${group_id}`,
        account: {
            id: req.session.user_id,
            name: req.session.login
        },
        text: lang,
        is_file: true,
        content: [
            {
                file: `group/tabs/${member_role == 0? "owner" : "member"}`,
                data: {
                    text: lang,
                    group_id: group_id,
                    active_tab: 4
                }
            }, 
            {
                file: `group/subjects/edit/${member_role == 0? "owner" : "member"}`,
                data: {
                    text: lang,
                    subjects: await api.getAllSubjects(group_id),
                    group_id: group_id
                }
            }
        ]
    })
}));


/* -------------------------------- Plan Page ------------------------------- */

router.get("/:group_id/plan", AsyncHandler(async (req, res) => {
    var lang = utils.get_language(req)

    var group_id = parseInt(req.params.group_id)
    var member_role = await api.isGroupMember(req.session.user_id, group_id)

    const days = {};

    (await api.getGroupPlan(group_id)).forEach(lesson => {
        if (lesson.day_of_week >= 0 && lesson.day_of_week <= 7) {
            if (!days[lesson.day_of_week]) {
                days[lesson.day_of_week] = [];
            }

            days[lesson.day_of_week].push({
                id: lesson.id,
                time: lesson.time,
                name: lesson.name,
                description: lesson.description
            });
        }
    });

    Object.keys(days).forEach(v => days[v] = days[v].sort((a, b) => (a.time > b.time) * 2 - 1));

    res.render("main", {
        title: `StudentRecordBook - Group ${group_id}`,
        account: {
            id: req.session.user_id,
            name: req.session.login
        },
        text: lang,
        is_file: true,
        content: [
            {
                file: `group/tabs/${member_role == 0? "owner" : "member"}`,
                data: {
                    text: lang,
                    group_id: group_id,
                    active_tab: 3
                }
            }, 
            {
                file: `group/plan/${member_role == 0? "owner" : "member"}`,
                data: {
                    text: lang,
                    group_id: group_id,
                    weekdays: utils.get_localisated_calendar(req),
                    days: days,
                    subjects: await api.getAllSubjects(group_id)
                }
            }
        ]
    })
}));



/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */


export { router }