const express = require("express");
const app = express();

app.get("/", (req, res, next) => {
	res.send("TESTING GET ROUTE");
});
app.get("/api", (req, res, next) => {
	res.json({ testKey: "testValue" });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log("Running on port 8080");
});
