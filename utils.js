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
    fs,
    cldr
} from './includes.js'

import * as api from './api.js'


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

var cal_ru = cldr.extractDayNames('ru', 'gregorian')

var cal_en = cldr.extractDayNames('en', 'gregorian')
function get_localisated_calendar(req) {
    var lang = req.headers['accept-language'];

    if (lang && lang.includes('ru')) {
        return cal_ru.standAlone.wide
    } else {
        return cal_en.standAlone.wide
    }
}



/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */


export { get_language, get_localisated_calendar }
