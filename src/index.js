const axios = require("axios");
const https = require("https");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tough = require("tough-cookie");
const querystring = require("querystring");
const he = require("he");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const config = require("./config").config;

let csrfToken = "";
let jSession = "";
let instance = "";

impexImport = async function (script) {
  await open();
  const scriptData = querystring.stringify({
    scriptContent: script,
    validationEnum: "IMPORT_STRICT",
    maxThreads: "16",
    encoding: "UTF-8",
    _legacyMode: "on",
    _enableCodeExecution: "on",
    _csrf: csrfToken,
  });

  const executeScript = await instance({
    method: "post",
    url: "/hac/console/impex/import",
    data: scriptData,
    headers: {
      Cookie: jSession,
      "X-CSRF-TOKEN": csrfToken,
    },
  });

  if (!executeScript.data.includes("Import finished successfully")) {
    const dom = new JSDOM(executeScript.data);
    const impexResult =
      dom.window.document.querySelector(".impexResult").textContent;
    throw new Error(
      `Impex import failed:\n${script}\n\nImpex result:\n${impexResult}`
    );
  }
};

flexibleSearch = async function (query) {
  await open();
  const queryData = querystring.stringify({
    flexibleSearchQuery: query,
    sqlQuery: "",
    maxCount: "200",
    user: "admin",
    locale: "en",
    commit: "false",
  });

  const executeQuery = await instance({
    method: "post",
    url: "/hac/console/flexsearch/execute",
    data: queryData,
    headers: {
      Cookie: jSession,
      "X-CSRF-TOKEN": csrfToken,
    },
  });

  const result = executeQuery.data;

  if (!result || result.resultList.length === 0) {
    throw new Error(`HAC Flexible Search returned 0 results:\n${query}`);
  }

  let resultMap = {};
  const headers = result.headers;
  const resultList = result.resultList[0];
  headers.forEach(
    (key, i) =>
      (resultMap[key.replace("p_", "")] =
        resultList[i] == null ? "" : he.decode(resultList[i]))
  );

  return resultMap;
};

executeScript = async function (
  script,
  commit = "true",
  scriptType = "groovy"
) {
  await open();
  const scriptData = querystring.stringify({
    script: script,
    scriptType: scriptType,
    commit: commit,
  });

  const executeScript = await instance({
    method: "post",
    url: "/hac/console/scripting/execute",
    data: scriptData,
    headers: {
      Cookie: jSession,
      "X-CSRF-TOKEN": csrfToken,
    },
  });

  const result = executeScript.data;

  if (!result || result.stacktraceText !== "") {
    throw new Error(`HAC Script error occurred:\n ${result.stacktraceText}`);
  }

  return result;
};

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
    withCredentials: "true",
    jar: cookieJar,
    baseURL: config.host,
    timeout: 2 * 60 * 1000,
  });
};

openHAC = async function () {
  const response = await instance.get("/hac/login.jsp");
  jSession = getJSessionId(response);
  csrfToken = getCsrfToken(response);
};

loginHAC = async function () {
  let data = querystring.stringify({
    j_username: config.USER_NAME,
    j_password: config.PASSWORD,
    submit: "login",
    _csrf: csrfToken,
  });
  const loginResponse = await instance({
    method: "post",
    url: "/hac/j_spring_security_check",
    data: data,
    headers: { Cookie: jSession },
  });

  csrfToken = getCsrfToken(loginResponse);
};

getJSessionId = function (response) {
  const cookieHeaders = response.headers["set-cookie"];
  const header = cookieHeaders.find(
    (element) => element.match("JSESSIONID") !== null
  );
  return header
    .split(";")
    .find((element) => element.match("JSESSIONID") !== null);
};

getCsrfToken = function (response) {
  return response.data.match('<meta name="_csrf" content="([^"]+)')[1];
};

module.exports = {
  impexImport,
  flexibleSearch,
  executeScript,
};
