const Employee = require("../models/employee");
const utils = require("../utils");

const employeeAuth = (req, res, next) => {
    if (!req.header("Authorization"))
        return res.status(200).send("Bad auth - needed auth token!");

    utils.vrifyJWTTken(req.header("Authorization").replace("Bearer ", ""), async (error, decoded) => {
        if (error) return res.send(error);

        try {
            const employee = await Employee.findOne({
                where: {
                    email: decoded.email
                }
            });

            if (!employee) return res.status(404).send({ messge: "User does not exists!" });

            req.body.employee = employee;
            next();
        } catch (e) {
            res.status(500).send(e)
        }
    });
};

module.exports = employeeAuth;