const sequelize = require("../db/sequelize");
const { DataTypes } = require("sequelize");

const utils = require("../utils");

const Employee = sequelize.define("employee", {
    fullName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        set(value) {
            this.setDataValue("email", value.toLowerCase());
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    token: {
        type: DataTypes.STRING
    }
}, {
    hooks: {
        beforeUpdate: async (admin) => {
            if (admin.changed('password'))
                admin.password = await utils.encrypt(admin.password);
        },
        beforeSave: async (employee) => {
            if (employee.changed('password'))
                employee.password = await utils.encrypt(employee.password);
        }
    }
});

module.exports = Employee;