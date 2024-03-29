const sequelize = require("../db/sequelize");
const { DataTypes } = require("sequelize");

const Designation = sequelize.define("designation", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
            this.setDataValue("name", value.toUpperCase());
        }
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    updatedAt: false
});

module.exports = Designation;