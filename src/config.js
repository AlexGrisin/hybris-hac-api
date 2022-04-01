require('dotenv').config();

exports.config = {
  HAC_USER: process.env.USER_NAME || "admin",
  HAC_PASSWORD: process.env.PASSWORD || "nimda",
  HAC_HOST: process.env.HAC_HOST,
  HYBRIS_VERSION: process.env.HYBRIS_VERSION || 5.7
};
