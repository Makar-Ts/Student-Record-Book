function validate_login(login) {
    return !!(login && login.match(/[a-zA-Z0-9_.-]{5,}/))
}

function validate_password(password) {
    return !!(password && password.match(/[a-zA-Z0-9_.-=*^#@!$%:;\/\\]{5,}/));
}

function validate_email(email) {
    return !!(email && email.match(/^(.+)@(\S+)/));
}


export { validate_email, validate_password, validate_login }