import express from 'express';
import session from 'express-session';
import useragent from 'express-useragent'
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import AsyncHandler from 'express-async-handler';
import ejs from 'ejs';
import cldr from 'cldr';

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const __dirname = dirname(fileURLToPath(import.meta.url));

import fs from 'fs';

export default 'includes';
export { 
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
}