const { Sequelize } = require("sequelize");
const db = require("../models/index");
require("dotenv").config();
const config = process.env;

const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  dialect: config.dialect,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connecting to Database");
    await db.sequelize.sync({});
    console.log("Database Sync Complete");
  } catch (error) {
    console.log("Error connecting to Database", error.message);
  }
};

module.exports = connectDB;
