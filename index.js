const querystring = require("querystring");
const he = require("he");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const hac = require("./src/hac");

impexImport = async function (script) {
  await hac.login();

  const scriptData = querystring.stringify({
    scriptContent: script,
    validationEnum: "IMPORT_STRICT",
    maxThreads: "16",
    encoding: "UTF-8",
    _legacyMode: "on",
    _enableCodeExecution: "on",
    _csrf: csrfToken,
  });

  const executeScript = await global.instance({
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
  await hac.login();

  const queryData = querystring.stringify({
    flexibleSearchQuery: query,
    sqlQuery: "",
    maxCount: "200",
    user: "admin",
    locale: "en",
    commit: "false",
  });

  const executeQuery = await global.instance({
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
  await hac.login();

  const scriptData = querystring.stringify({
    script: script,
    scriptType: scriptType,
    commit: commit,
  });

  const executeScript = await global.instance({
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

module.exports = {
  impexImport,
  flexibleSearch,
  executeScript,
};
