const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "secret";

const encrypt = async (str) => {
    const hash = await bcrypt.hash(str, 8);
    return hash;
}

const verifyHash = async (str, hash) => {
    const isValid = await bcrypt.compare(str, hash);
    return isValid;
}

const getJWTToken = (object) => {
    return jwt.sign(object, JWT_SECRET);
}

const vrifyJWTTken = (token, callback) => {
    jwt.verify(token, JWT_SECRET, async (error, decoded) => {
        await callback(error, decoded);
    });
}

module.exports = {
    encrypt,
    verifyHash,
    getJWTToken,
    vrifyJWTTken
}