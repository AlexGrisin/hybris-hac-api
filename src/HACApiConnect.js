const axios = require("axios");
const https = require("https");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tough = require("tough-cookie");
const querystring = require("querystring");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

global.csrfToken = "";
global.jSession = "";
global.instance = "";

login = async function () {
  instance = build();
  await openHAC();
  await loginHAC();
};

build = function () {
  if (!config.HAC_HOST) {
    throw Error(
      "HAC_HOST is not configured. Please use .env file for configuration or set it via configure() method."
    );
  }
  axiosCookieJarSupport(axios);
  const cookieJar = new tough.CookieJar();
  return axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
    withCredentials: "true",
    jar: cookieJar,
    baseURL: config.HAC_HOST,
    timeout: 2 * 60 * 1000,
  });
};

openHAC = async function () {
  try {
    const response = await instance.get("/hac/login.jsp");
    jSession = getJSessionId(response);
    csrfToken = getCsrfToken(response);
  } catch (e) {
    throw new Error(`HAC open failed: ${e.message}`);
  }
};

loginHAC = async function () {
  let data = querystring.stringify({
    j_username: config.HAC_USER,
    j_password: config.HAC_PASSWORD,
    submit: "login",
    _csrf: csrfToken,
  });

  const loginResponse = await instance({
    method: "post",
    url: "/hac/j_spring_security_check",
    data: data,
    headers: { Cookie: jSession },
  });

  const dom = new JSDOM(loginResponse.data);
  if (dom.window.document.querySelector("#console") === null) {
    const loginError =
      dom.window.document.querySelector("#loginErrors").textContent;
    throw new Error(`HAC login failed: ${loginError}\n${loginResponse.data}`);
  }

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
  const csrf = response.data.match('<meta name="_csrf" content="([^"]+)');
  return csrf ? csrf[1] : "";
};

module.exports = {
  login,
};
