const express = require("express");
require("./db/dbSyncer");

const routeAdmin = require("./routes/admin");
const routeEmployee = require("./routes/employee");

const app = express();
const port = 3000;

app.use(express.json());

app.use(routeAdmin);
app.use(routeEmployee);

app.get("", (req, res) => {
    res.send("App is running!");
});

app.listen(port, () => {
    console.log("App is running!");
});