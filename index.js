const { impexImportExecute } = require("./src/ImpexImportExecute");
const { flexibleSearchExecute } = require("./src/FlexibleSearchExecute");
const { scriptExecute } = require("./src/ScriptExecute");
const { updateConfig } = require("./src/config");

configure = function (host, user, password, hybrisVersion) {
  updateConfig(host, user, password, hybrisVersion);
  return this;
}

impexImport = async function (script) {
  impexImportExecute(script);
};

flexibleSearch = async function (query) {
  return flexibleSearchExecute(query);
};

executeScript = async function (
  script,
  commit = "true",
  scriptType = "groovy"
) {
  return scriptExecute(script, commit, scriptType);
};

module.exports = { 
  configure,
  impexImport,
  flexibleSearch,
  executeScript,
};
