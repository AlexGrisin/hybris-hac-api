const querystring = require("querystring");
const hac = require("./HACApiConnect");

exports.scriptExecute = async function (
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

  let url =
    process.env.HYBRIS_VERSION < 5.7
      ? `/hac/console/${scriptType}/execute`
      : "/hac/console/scripting/execute";

  const executeScript = await global.instance({
    method: "post",
    url: url,
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