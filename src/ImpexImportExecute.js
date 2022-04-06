const querystring = require("querystring");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const hac = require("hybris-hac-api/src/HACApiConnect");

exports.impexImportExecute= async function (script) {
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

  console.log(executeScript.data);
};