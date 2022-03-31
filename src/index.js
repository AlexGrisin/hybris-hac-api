const axios = require('axios');
const https = require('https');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const querystring = require('querystring');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const config = require('./config').config;

let csrfToken = '';
let jSession = '';
let instance = '';


exports.impexImport = async function (script) {
  await open();
  const scriptData = querystring.stringify({
    scriptContent: script,
    validationEnum: 'IMPORT_STRICT',
    maxThreads: '16',
    encoding: 'UTF-8',
    _legacyMode: 'on',
    _enableCodeExecution: 'on',
    _csrf: csrfToken,
  });

  const executeScript = await instance({
    method: 'post',
    url: '/hac/console/impex/import',
    data: scriptData,
    headers: {
      Cookie: jSession,
      'X-CSRF-TOKEN': csrfToken,
    },
  });

  if (!executeScript.data.includes('Import finished successfully')) {
    const dom = new JSDOM(executeScript.data);
    const impexResult = dom.window.document.querySelector('.impexResult').textContent;
    throw new Error(`Impex import failed:\n${script}\n\nImpex result:\n${impexResult}`);
  }
}

open = async function () {
  instance = build();
  await openHAC();
  await loginHAC();
};

build = function () {
  axiosCookieJarSupport(axios);
  const cookieJar = new tough.CookieJar();
  return axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
    withCredentials: 'true',
    jar: cookieJar,
    baseURL: config.host,
    timeout: 2 * 60 * 1000,
  });
}

openHAC = async function () {
  const response = await instance.get('/hac/login.jsp');
  jSession = getJSessionId(response);
  csrfToken = getCsrfToken(response);
}

loginHAC = async function () {
  let data = querystring.stringify({
    j_username: config.USER_NAME,
    j_password: config.PASSWORD,
    submit: 'login',
    _csrf: csrfToken,
  });
  const loginResponse = await instance({
    method: 'post',
    url: '/hac/j_spring_security_check',
    data: data,
    headers: { Cookie: jSession },
  });
  
  csrfToken = getCsrfToken(loginResponse);
}

getJSessionId = function (response) {
  const cookieHeaders = response.headers['set-cookie'];
  const header = cookieHeaders.find(element => element.match('JSESSIONID') !== null);
  return header.split(';').find(element => element.match('JSESSIONID') !== null);
}

getCsrfToken = function (response) {
  return response.data.match('<meta name="_csrf" content="([^"]+)')[1];
}