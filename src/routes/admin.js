const express = require("express");
const Admin = require("../models/admin");
const router = new express.Router();
const utils = require("../utils");
const adminAuth = require("../middlewares/adminAuth");
const Department = require("../models/department");
const Designation = require("../models/designation");
const Shift = require("../models/shift");

router.post("/admin/register", async (req, res) => {
    if (!req.body || req.body.length === 0) {
        return res.status(400).send("Invalid body");
    }

    if (!req.body.fullName) return res.status(400).send("fullName required!");
    if (!req.body.mobile) return res.status(400).send("mobile required!");
    if (!req.body.email) return res.status(400).send("email required!");
    if (!req.body.password) return res.status(400).send("password required!");

    try {
        const admin = await Admin.create(req.body);
        admin.password = undefined;
        res.status(200).send(admin);
    } catch (e) {
        res.status(500).send({ error: e });
    }
});

router.post("/admin/login", async (req, res) => {
    if (!req.body || req.body.length === 0) {
        return res.status(400).send("Invalid body");
    }

    if (!req.body.email) return res.status(400).send("email required!");
    if (!req.body.password) return res.status(400).send("password required!");

    try {
        const admin = await Admin.findOne({
            where: {
                email: req.body.email
            }
        });

        if (!admin) return res.status(404).send({ message: "Admin not found with this email" });

        const isValid = await utils.verifyHash(req.body.password, admin.password);

        if (!isValid) return res.status(401).send({ message: "Wrong Password!" });

        admin.token = utils.getJWTToken({ email: admin.email, id: admin.id });
        await admin.save();

        res.status(200).send({ token: admin.token });

    } catch (e) {
        res.status(500).send({ error: e.errors });
    }
});

router.get("/admin", adminAuth, async (req, res) => {
    try {
        req.body.admin.password = undefined;
        res.status(200).send(req.body.admin);
    } catch (e) {
        res.status(500).send({ error: e.errors });
    }
});

// this can be used to change password
router.put("/admin", adminAuth, async (req, res) => {
    const allowedUpdates = ["fullName", "mobile", "email", "password"];

    if (!req.body || req.body.length === 0) {
        return res.status(400).send("Invalid body");
    }
    const admin = req.body.admin;
    delete req.body.admin;

    const requestedUpdates = Object.keys(req.body);

    const isValid = requestedUpdates.every(update => {
        return allowedUpdates.includes(update);
    });

    if (!isValid) {
        return res.status(400).send({ error: "Invalid updates requested!" });
    }

    const updates = {};
    requestedUpdates.forEach(update => {
        updates[update] = req.body[update];
    });

    try {
        const updated = await Admin.update(updates, {
            where: {
                id: admin.id
            }
        });
        res.status(200).send(updated);
    } catch (e) {
        res.status(500).send({ error: e });
    }
});

router.delete("/admin", adminAuth, async (req, res) => {
    try {
        const result = await Admin.destroy({
            where: { id: req.body.admin.id }
        });
        res.status(200).send({ result });
    } catch (e) {
        res.status(500).send({ error: e });
    }
});

router.put("/admin/forgotPassword", async (req, res) => {
    if (!req.body || req.body.length === 0) {
        return res.status(400).send("Invalid body");
    }

    if (!req.body.email) return res.status(400).send("email required!");
    if (!req.body.password) return res.status(400).send("password required!");

    try {
        const admin = await Admin.findOne({
            where: {
                email: req.body.email
            }
        });
        if (!admin) return res.status(404).send({ message: "User does not exists!" });

        const updated = await Admin.update({ "password": req.body.password }, {
            where: {
                email: req.body.email
            }
        });
        res.status(200).send(updated);
    } catch (e) {
        res.status(500).send({ error: e });
    }

});



router.post("/admin/department", adminAuth, async (req, res) => {
    if (!req.body || req.body.length === 0) {
        return res.status(400).send("Invalid body");
    }

    if (!req.body.name) return res.status(400).send("name required!");

    try {
        const department = await Department.create({ name: req.body.name, createdBy: req.body.admin.id });
        res.status(200).send(department);
    } catch (e) {
        res.status(500).send({ error: e });
    }
});

// considering admin can only fetch data they created
router.get("/admin/department", adminAuth, async (req, res) => {
    try {
        const depatrments = await Department.findAll({
            where: {
                createdBy: req.body.admin.id
            }
        });
        res.status(200).send(depatrments);
    } catch (e) {
        res.status(500).send({ error: e });
    }
});

router.delete("/admin/department/:id", adminAuth, async (req, res) => {
    try {
        const department = await Department.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!department) return res.status(404).send({ message: "Department does not exists!" })

        if (department.createdBy !== req.body.admin.id)
            return res.status(401).send({ message: "Bad auth - You do not have right to delete it!" });

        const result = await Department.destroy({
            where: {
                id: req.params.id
            }
        });
        res.status(200).send({ result });
    } catch (e) {
        res.status(500).send({ error: e });
    }
});

router.put("/admin/department", adminAuth, async (req, res) => {
    if (!req.body || req.body.length === 0) {
        return res.status(400).send("Invalid body");
    }

    if (!req.body.id) return res.status(400).send("id required!");
    if (!req.body.name) return res.status(400).send("name required!");

    try {
        const department = await Department.findOne({
            where:
            {
                id: req.body.id
            }
        });

        if (!department) return res.status(404).send({ message: "department does not exists!" });

        if (department.createdBy !== req.body.admin.id)
            return res.status(401).send({ message: "Bad auth - You do not have right to update it!" });

        const updated = await Department.update({ "name": req.body.name }, {
            where: {
                id: department.id
            }
        });

        res.status(200).send(updated);
    } catch (e) {
        res.status(500).send({ error: e });
    }
});


router.post("/admin/designation", adminAuth, async (req, res) => {
    if (!req.body || req.body.length === 0) {
        return res.status(400).send("Invalid body");
    }

    if (!req.body.name) return res.status(400).send("name required!");

    try {
        const designation = await Designation.create({ name: req.body.name, createdBy: req.body.admin.id });
        res.status(200).send(designation);
    } catch (e) {
        res.status(500).send({ error: e });
    }
});


router.get("/admin/designation", adminAuth, async (req, res) => {
    try {
        const designation = await Designation.findAll({
            where: {
                createdBy: req.body.admin.id
            }
        });
        res.status(200).send(designation);
    } catch (e) {
        res.status(500).send({ error: e });
    }
});

router.delete("/admin/designation/:id", adminAuth, async (req, res) => {
    try {
        const designation = await Designation.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!designation) return res.status(404).send({ message: "Department does not exists!" })

        if (designation.createdBy !== req.body.admin.id)
            return res.status(401).send({ message: "Bad auth - You do not have right to delete it!" });

        const result = await Designation.destroy({
            where: {
                id: req.params.id
            }
        });
        res.status(200).send({ result });
    } catch (e) {
        res.status(500).send({ error: e });
    }
});

router.put("/admin/designation", adminAuth, async (req, res) => {
    if (!req.body || req.body.length === 0) {
        return res.status(400).send("Invalid body");
    }

    if (!req.body.id) return res.status(400).send("id required!");
    if (!req.body.name) return res.status(400).send("name required!");

    try {
        const designation = await Designation.findOne({
            where:
            {
                id: req.body.id
            }
        });

        if (!designation) return res.status(404).send({ message: "designation does not exists!" });

        if (designation.createdBy !== req.body.admin.id)
            return res.status(401).send({ message: "Bad auth - You do not have right to update it!" });

        const updated = await Designation.update({ "name": req.body.name }, {
            where: {
                id: designation.id
            }
        });

        res.status(200).send(updated);
    } catch (e) {
        res.status(500).send({ error: e });
    }
});

router.post("/admin/shift", adminAuth, async (req, res) => {
    if (!req.body || req.body.length === 0) {
        return res.status(400).send("Invalid body");
    }

    if (!req.body.name) return res.status(400).send("name required!");

    try {
        const shift = await Shift.create({ name: req.body.name, createdBy: req.body.admin.id });
        res.status(200).send(shift);
    } catch (e) {
        res.status(500).send({ error: e });
    }
});

router.get("/admin/shift", adminAuth, async (req, res) => {
    try {
        const shift = await Shift.findAll({
            where: {
                createdBy: req.body.admin.id
            }
        });
        res.status(200).send(shift);
    } catch (e) {
        res.status(500).send({ error: e });
    }
});

router.delete("/admin/shift/:id", adminAuth, async (req, res) => {
    try {
        const shift = await Shift.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!shift) return res.status(404).send({ message: "Department does not exists!" })

        if (shift.createdBy !== req.body.admin.id)
            return res.status(401).send({ message: "Bad auth - You do not have right to delete it!" });

        const result = await Shift.destroy({
            where: {
                id: req.params.id
            }
        });
        res.status(200).send({ result });
    } catch (e) {
        res.status(500).send({ error: e });
    }
});

router.put("/admin/shift", adminAuth, async (req, res) => {
    if (!req.body || req.body.length === 0) {
        return res.status(400).send("Invalid body");
    }

    if (!req.body.id) return res.status(400).send("id required!");
    if (!req.body.name) return res.status(400).send("name required!");

    try {
        const shift = await Shift.findOne({
            where:
            {
                id: req.body.id
            }
        });

        if (!shift) return res.status(404).send({ message: "shift does not exists!" });

        if (shift.createdBy !== req.body.admin.id)
            return res.status(401).send({ message: "Bad auth - You do not have right to update it!" });

        const updated = await Shift.update({ "name": req.body.name }, {
            where: {
                id: shift.id
            }
        });

        res.status(200).send(updated);
    } catch (e) {
        res.status(500).send({ error: e });
    }
});

module.exports = router;