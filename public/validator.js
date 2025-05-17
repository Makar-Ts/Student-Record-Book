


/* -------------------------------------------------------------------------- */
/*                                    Login                                   */
/* -------------------------------------------------------------------------- */


function validate_login(login) {
    return !!(login && login.match(/[a-zA-Z0-9_.-]{5,}/))
}

function validate_password(password) {
    return !!(password && password.match(/[a-zA-Z0-9_.-=*^#@!$%:;\/\\]{5,}/));
}

function validate_email(email) {
    return !!(email && email.match(/^(.+)@(\S+)/));
}



/* -------------------------------------------------------------------------- */
/*                                Group Create                                */
/* -------------------------------------------------------------------------- */


function validate_group_name(name) {
    return !!(name && name.match(/[a-zA-Z0-9_.-]{5,}/));
}



/* -------------------------------------------------------------------------- */
/*                                 Group Join                                 */
/* -------------------------------------------------------------------------- */



function validate_group_code(code) {
    return !!(code && code.match(/^[A-Za-z0-9_-]+={2}$/) && code.length == 88);
}



/* -------------------------------------------------------------------------- */
/*                               Group Subjects                               */
/* -------------------------------------------------------------------------- */


function validate_subject_name(name) {
    return !!(name);
}



/* -------------------------------------------------------------------------- */
/*                                Group Lessons                               */
/* -------------------------------------------------------------------------- */


function validate_time(time) {
    return /^\d+:\d+$/.test(time);
}

function validate_day(day) {
    return Number.isInteger(day) && day >= 0 && day <= 7;
}



/* -------------------------------------------------------------------------- */
/*                                   Export                                   */
/* -------------------------------------------------------------------------- */


export { validate_email, validate_password, validate_login, validate_group_name, validate_group_code, validate_subject_name, validate_time, validate_day }