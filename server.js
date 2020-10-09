const express = require("express");
const db = require("./db/db");
const app = express();
const { User } = require("./db/models");

app.get("/", async (req, res, next) => {
	let users = await User.findAll();
	res.json(users);
});
app.get("/api", (req, res, next) => {
	res.json({ testKey: "testValue" });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log("Running on port 8080");
});

db.sync();
