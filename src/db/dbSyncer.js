const { Sequelize } = require("sequelize");
const sequelize = require("./sequelize");

const Admin = require("../models/admin");
const User = require("../models/employee");
const Department = require("../models/department");
const Designation = require("../models/designation");
const Shift = require("../models/shift");

sequelize.sync({
    force: true
});