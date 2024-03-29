const sequelize = require("../db/sequelize");
const { DataTypes } = require("sequelize");

const Shift = sequelize.define("shift", {
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

module.exports = Shift;