


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
    return!!(name && name.match(/^[a-zA-Z0-9_. -]{3,}/));
}



/* -------------------------------------------------------------------------- */
/*                                   Export                                   */
/* -------------------------------------------------------------------------- */


export { validate_email, validate_password, validate_login, validate_group_name, validate_group_code, validate_subject_name }