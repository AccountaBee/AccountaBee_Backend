const express = require("express");
const db = require("./db/db");
const app = express();

app.get("/", async (req, res, next) => {
	res.send("TESTING GET ROUTE");
});
app.get("/api", (req, res, next) => {
	res.json({ testKey: "testValue" });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log("Running on port 8080");
});

db.sync();
