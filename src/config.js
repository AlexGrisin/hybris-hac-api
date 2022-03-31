require('dotenv').config();

exports.config = {
  HAC_USER: process.env.USER_NAME || "admin",
  HAC_PASSWORD: process.env.PASSWORD || "nimda",
  HAC_HOST: process.env.host,
};
