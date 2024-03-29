const express = require("express");
const Employee = require("../models/employee");
const router = new express.Router();
const employeeAuth = require("../middlewares/employeeAuth");
const utils = require("../utils");

router.post("/employee/register", async (req, res) => {
    if (!req.body || req.body.length === 0) {
        return res.status(400).send("Invalid body");
    }

    if (!req.body.fullName) return res.status(400).send("fullName required!");
    if (!req.body.mobile) return res.status(400).send("mobile required!");
    if (!req.body.email) return res.status(400).send("email required!");
    if (!req.body.password) return res.status(400).send("password required!");

    try {
        const employee = await Employee.create(req.body);
        employee.password = undefined;
        res.status(200).send(employee);
    } catch (e) {
        res.status(500).send({ error: e });
    }
});

router.post("/employee/login", async (req, res) => {
    if (!req.body || req.body.length === 0) {
        return res.status(400).send("Invalid body");
    }

    if (!req.body.email) return res.status(400).send("email required!");
    if (!req.body.password) return res.status(400).send("password required!");

    try {
        const employee = await Employee.findOne({
            where: {
                email: req.body.email
            }
        });

        if (!employee) return res.status(404).send({ message: "Employee not found with this email" });

        const isValid = await utils.verifyHash(req.body.password, employee.password);

        if (!isValid) return res.status(401).send({ message: "Wrong Password!" });

        employee.token = utils.getJWTToken({ email: req.body.email, passwrod: req.body.password });
        await employee.save();

        res.status(200).send({ token: employee.token });

    } catch (e) {
        res.status(500).send({ error: e.errors });
    }
});

router.get("/employee", employeeAuth, async (req, res) => {
    try {
        req.body.employee.password = undefined;
        res.status(200).send(req.body.employee);
    } catch (e) {
        res.status(500).send({ error: e.errors });
    }
});

module.exports = router;