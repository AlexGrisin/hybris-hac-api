require('dotenv').config();

global.config = {
  HAC_USER: process.env.USER_NAME || "admin",
  HAC_PASSWORD: process.env.PASSWORD || "nimda",
  HAC_HOST: process.env.HAC_HOST,
  HYBRIS_VERSION: process.env.HYBRIS_VERSION || 5.7
};

updateConfig = function (host, userName, password, hybrisVersion) {
  host ? config.HAC_HOST = host : config.HAC_HOST;
  userName ? config.HAC_USER = userName : config.HAC_USER;
  password ? config.HAC_PASSWORD = password : config.HAC_PASSWORD;
  hybrisVersion ? config.HYBRIS_VERSION = hybrisVersion : config.HYBRIS_VERSION;
}

module.exports = {
  config,
  updateConfig
}