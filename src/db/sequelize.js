const Sequelize = require("sequelize");

const sequelize = new Sequelize("db_office_management", "root", "", {
    host: "localhost",
    dialect: "mysql"
});

module.exports = sequelize;