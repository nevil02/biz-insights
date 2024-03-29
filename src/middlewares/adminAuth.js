const Admin = require("../models/admin");
const utils = require("../utils");

const adminAuth = (req, res, next) => {
    if (!req.header("Authorization"))
        return res.status(200).send("Bad auth - needed auth token!");

    utils.vrifyJWTTken(req.header("Authorization").replace("Bearer ", ""), async (error, decoded) => {
        if (error) return res.send(error);

        try {
            const admin = await Admin.findOne({
                where: {
                    email: decoded.email,
                    id: decoded.id
                }
            });

            if (!admin) return res.status(404).send({ messge: "User does not exists!" });

            req.body.admin = admin;
            next();
        } catch (e) {
            res.status(500).send({ error: "User not found!" })
        }
    });
};

module.exports = adminAuth;