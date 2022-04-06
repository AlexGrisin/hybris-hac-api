const querystring = require("querystring");
const he = require("he");
const hac = require("./HACApiConnect");

exports.flexibleSearchExecute = async function (query) {
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

  if (!result || !result.resultList || result.resultList.length === 0) {
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